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


# ────────────────────────────────────────────────────────────────────────────────
@doc_bp.get("/")  # GET /api/documents?org_id=1
def list_documents():
    org_id = request.args.get("org_id", type=int)
    if org_id is None:
        abort(400, description="`org_id` query param is required")

    docs = (
        Document.query.filter_by(org_id=org_id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return jsonify(
        [
            {
                "id": d.id,
                "filename": d.filename,
                "hash": d.hash,
                "created_at": d.created_at.isoformat(),
            }
            for d in docs
        ]
    )


# ────────────────────────────────────────────────────────────────────────────────
@doc_bp.post("/upload")  # POST multipart/form-data
def upload_documents():
    # 1) Resolve organisation ---------------------------------------------------
    org_id = request.form.get("org_id", type=int)
    new_org_name = (request.form.get("new_org_name") or "").strip()

    if org_id:
        org = Organization.query.get_or_404(org_id)
    elif new_org_name:
        try:
            org = Organization(name=new_org_name)
            db.session.add(org)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            abort(409, description="Organisation already exists")
    else:
        abort(400, description="Provide either `org_id` or `new_org_name`")

    # 2) Validate files --------------------------------------------------------
    files = request.files.getlist("files")
    if not files:
        abort(400, description="No files uploaded")

    saved_docs = []
    upload_dir = Path(current_app.config["UPLOAD_FOLDER"]) / f"org_{org.id}"
    upload_dir.mkdir(parents=True, exist_ok=True)

    for storage in files:
        filename = secure_filename(storage.filename)
        if not filename:
            continue  # skip blanks

        # Compute hash for deduplication
        file_hash = _sha256(storage.stream)

        # Persist to disk
        dest = upload_dir / filename
        storage.save(dest)

        # DB row
        doc = Document(
            org_id=org.id,
            filename=filename,
            hash=file_hash,
            created_at=datetime.utcnow(),
        )
        db.session.add(doc)
        saved_docs.append(doc)

    db.session.commit()

    return (
        jsonify(
            [
                {
                    "id": d.id,
                    "filename": d.filename,
                    "hash": d.hash,
                    "created_at": d.created_at.isoformat(),
                }
                for d in saved_docs
            ]
        ),
        201,
    )


# ────────────────────────────────────────────────────────────────────────────────
@doc_bp.delete("/<int:doc_id>")
def delete_document(doc_id: int):
    doc = Document.query.get_or_404(doc_id)

    # Remove file from disk
    upload_dir = Path(current_app.config["UPLOAD_FOLDER"]) / f"org_{doc.org_id}"
    try:
        (upload_dir / doc.filename).unlink(missing_ok=True)
    except Exception:
        pass  # ignore fs errors

    db.session.delete(doc)
    db.session.commit()
    return jsonify({"deleted_id": doc_id})


# ────────────────────────────────────────────────────────────────────────────────
@doc_bp.put("/<int:doc_id>")
def update_document(doc_id: int):
    """Rename a document filename."""
    doc = Document.query.get_or_404(doc_id)
    data = request.get_json(silent=True) or {}
    new_name = (data.get("filename") or "").strip()
    if not new_name:
        abort(400, description="`filename` is required")

    # Move the file on disk
    upload_dir = Path(current_app.config["UPLOAD_FOLDER"]) / f"org_{doc.org_id}"
    old_path = upload_dir / doc.filename
    new_path = upload_dir / secure_filename(new_name)
    if old_path.exists():
        old_path.rename(new_path)

    doc.filename = new_path.name
    db.session.commit()
    return jsonify({"id": doc.id, "filename": doc.filename})
