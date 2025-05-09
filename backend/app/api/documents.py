"""
Document API endpoints

Prefix (set in create_app):  /api/documents
"""

from pathlib import Path
import hashlib
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app, abort
from werkzeug.utils import secure_filename
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Document, Organization

doc_bp = Blueprint("documents", __name__)

# ────────────────────────────────────────────────────────────────────────────────
def _sha256(stream) -> str:
    """Return hex SHA-256 for a binary stream (consumes stream!)."""
    h = hashlib.sha256()
    for chunk in iter(lambda: stream.read(8192), b""):
        h.update(chunk)
    stream.seek(0)
    return h.hexdigest()


# ── URLs now nest under organisations -----------------------------------------
@doc_bp.get("/organizations/<int:org_id>/documents")
def list_documents(org_id):
    docs = (Document.query
                      .filter_by(org_id=org_id)
                      .order_by(Document.created_at.desc())
                      .all())
    return jsonify([d.as_dict() for d in docs])


@doc_bp.post("/organizations/<int:org_id>/documents")
def upload_document(org_id):
    """Multipart POST {file}"""
    if "file" not in request.files:
        abort(400, "`file` field missing")

    org = Organization.query.get_or_404(org_id)
    f   = request.files["file"]
    buf = f.read()
    sha = hashlib.sha256(buf).hexdigest()

    # save in DB
    doc = Document(
        org_id=org.id,
        filename=secure_filename(f.filename or "upload"),
        content=buf,
        hash=sha,
        size_bytes=len(buf),
    )
    db.session.add(doc)
    db.session.commit()
    return jsonify(doc.as_dict())


@doc_bp.patch("/documents/<int:doc_id>")
def rename_document(doc_id):
    new = request.json.get("filename")
    if not new:
        abort(400, "`filename` required")
    doc = Document.query.get_or_404(doc_id)
    doc.filename = secure_filename(new)
    db.session.commit()
    return jsonify(doc.as_dict())


@doc_bp.delete("/documents/<int:doc_id>")
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"ok": True})
