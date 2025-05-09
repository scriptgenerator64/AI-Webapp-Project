from flask import request, jsonify, abort
from . import bp
from ..services.rag import answer

@bp.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(force=True) or {}
    org_ids = payload.get("org_ids") or []
    query = payload.get("query", "")
    if not org_ids or not query:
        abort(400, "org_ids and query required")

    reply, sources = answer(org_ids, query)
    return jsonify({"answer": reply, "sources": sources})
