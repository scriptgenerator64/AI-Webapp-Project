"""
REST endpoints for Organisations.

URL prefix is injected by create_app:
    /api/organizations

Routes
------
GET  /                    → list organisations
POST /                    → create organisation   { "name": "Acme" }
GET  /<int:org_id>        → single organisation
DELETE /<int:org_id>      → delete organisation (and its docs)
"""

from flask import Blueprint, request, jsonify, abort
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Organization, Document

org_bp = Blueprint("organizations", __name__)


# ────────────────────────────────────────────────────────────────────────
@org_bp.get("/")  # GET /api/organizations
def list_orgs():
    orgs = Organization.query.order_by(Organization.id).all()
    return jsonify([{"id": o.id, "name": o.name} for o in orgs])


# ────────────────────────────────────────────────────────────────────────
@org_bp.post("/")  # POST /api/organizations
def create_org():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, description="`name` is required")

    try:
        org = Organization(name=name)
        db.session.add(org)
        db.session.commit()
        return jsonify({"id": org.id, "name": org.name}), 201
    except IntegrityError:
        db.session.rollback()
        abort(409, description="Organisation already exists")


# ────────────────────────────────────────────────────────────────────────
@org_bp.get("/<int:org_id>")
def get_org(org_id: int):
    org = Organization.query.get_or_404(org_id)
    return jsonify({"id": org.id, "name": org.name})


# ────────────────────────────────────────────────────────────────────────
@org_bp.delete("/<int:org_id>")
def delete_org(org_id: int):
    org = Organization.query.get_or_404(org_id)

    # cascade delete (explicit so we can confirm row count)
    n_docs = Document.query.filter_by(org_id=org.id).delete()
    db.session.delete(org)
    db.session.commit()

    return jsonify(
        {"deleted_org_id": org.id, "deleted_documents": n_docs}
    )
