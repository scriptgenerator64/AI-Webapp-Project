from flask import request, jsonify, abort
from . import bp
from ..services.embeddings import semantic_search

@bp.route("/search", methods=["POST"])
def search():
    payload = request.get_json(force=True) or {}
    org_ids = payload.get("org_ids") or []
    query = payload.get("query", "")
    k = int(payload.get("k", 5))
    if not org_ids or not query:
        abort(400, "org_ids and query required")

    results = semantic_search(org_ids, query, k)
    return jsonify([
        {
            "score": s,
            "document_id": e.document_id,
            "chunk_index": e.chunk_index,
            "text": e.text,
        }
        for s, e in results
    ])
