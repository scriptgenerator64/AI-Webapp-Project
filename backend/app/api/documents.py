import os
from pathlib import Path
from flask import request, jsonify, abort, current_app, send_from_directory
from werkzeug.utils import secure_filename
from . import bp
from .. import db
from ..models import Organization, Document
from ..utils.hashing import sha256_digest
from ..services.embeddings import index_document

def _org_or_404(org_id: int):
    org = Organization.query.get(org_id)
    if not org:
        abort(404, "organization not found")
    return org

@bp.route("/organizations/<int:org_id>/documents", methods=["GET"])
def list_docs(org_id):
    org = _org_or_404(org_id)
    return jsonify([
        {"id": d.id, "filename": d.filename, "hash": d.hash, "metadata": d.metadata}
        for d in org.documents
    ])

@bp.route("/organizations/<int:org_id>/documents", methods=["POST"])
def upload_doc(org_id):
    org = _org_or_404(org_id)
    if "file" not in request.files:
        abort(400, "file field required")
    file = request.files["file"]
    filename = secure_filename(file.filename)
    if not filename:
        abort(400, "empty filename")

    data = file.read()
    digest = sha256_digest(data)

    up_dir = current_app.config["UPLOAD_FOLDER"] / str(org_id)
    up_dir.mkdir(parents=True, exist_ok=True)
    (up_dir / filename).write_bytes(data)

    doc = Document(
        organization=org,
        filename=filename,
        hash=digest,
        metadata=request.form.get("metadata", type=dict) or {},
        content=data.decode("utf-8", errors="ignore"),
    )
    db.session.add(doc)
    db.session.commit()
    index_document(doc)              # build embeddings

    return jsonify({"id": doc.id, "filename": filename, "hash": digest}), 201

@bp.route("/documents/<int:doc_id>", methods=["GET"])
def download_doc(doc_id):
    doc = Document.query.get_or_404(doc_id)
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"] / str(doc.org_id),
        doc.filename,
        as_attachment=True,
    )

@bp.route("/documents/<int:doc_id>", methods=["PUT"])
def update_doc(doc_id):
    doc = Document.query.get_or_404(doc_id)
    data = request.get_json(force=True)
    doc.metadata = data.get("metadata", doc.metadata)
    db.session.commit()
    return jsonify({"id": doc.id, "metadata": doc.metadata})

@bp.route("/documents/<int:doc_id>", methods=["DELETE"])
def delete_doc(doc_id):
    doc = Document.query.get_or_404(doc_id)
    fpath = current_app.config["UPLOAD_FOLDER"] / str(doc.org_id) / doc.filename
    if fpath.exists():
        os.remove(fpath)
    db.session.delete(doc)
    db.session.commit()
    return "", 204
