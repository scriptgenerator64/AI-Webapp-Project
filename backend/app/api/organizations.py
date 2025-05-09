from flask import request, jsonify, abort
from . import bp
from .. import db
from ..models import Organization

@bp.route("/organizations", methods=["GET"])
def list_orgs():
    return jsonify([{"id": o.id, "name": o.name} for o in Organization.query.all()])

@bp.route("/organizations", methods=["POST"])
def create_org():
    name = (request.get_json(force=True) or {}).get("name")
    if not name:
        abort(400, "name required")
    org = Organization(name=name)
    db.session.add(org)
    db.session.commit()
    return jsonify({"id": org.id, "name": org.name}), 201
