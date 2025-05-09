from flask import request, jsonify, abort
from . import bp                           #    ← your Blueprint
from ..models import Document
from ..services.embeddings import semantic_search

@bp.route("/search", methods=["POST"])
def search():
    payload = request.get_json(force=True) or {}
    org_ids = payload.get("org_ids", [])
    query   = payload.get("query", "")
    k       = int(payload.get("k", 5))

    if not org_ids or not query:
        abort(400, "org_ids and query required")

    hits = semantic_search(org_ids, query, k)

    # return **documents**, de-duplicated, most relevant first
    seen, docs = set(), []
    for _score, emb in hits:
        d = emb.document
        if d.id not in seen:
            docs.append(d.as_dict())
            seen.add(d.id)
        if len(docs) == k:
            break

    return jsonify(docs)
