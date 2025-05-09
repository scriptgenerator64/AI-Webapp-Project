"""
Vector-store helpers (sensitive version).
"""

from __future__ import annotations
import numpy as np
import tiktoken
from openai import OpenAI
from ..models import Embedding, Document
from .. import db

# ──────────────────────────────────────────────────────────────────────────
EMBED_MODEL            = "text-embedding-3-large"
TOKEN_LIMIT_PER_CHUNK  = 800
TOKEN_BUDGET           = 300_000           # OpenAI hard cap per request
SIMILARITY_FLOOR       = 0.1              # ← tighten / loosen here
ENCODER                = tiktoken.encoding_for_model("gpt-4o-mini")
client                 = OpenAI()

# ──────────────────────────────────────────────────────────────────────────
def _split(text: str, max_tokens: int = TOKEN_LIMIT_PER_CHUNK):
    words, chunk, n = text.split(), [], 0
    for w in words:
        t = len(ENCODER.encode(w + " "))
        if n + t > max_tokens:
            yield " ".join(chunk)
            chunk, n = [], 0
        chunk.append(w)
        n += t
    if chunk:
        yield " ".join(chunk)

def _embed(texts: list[str]):
    out, batch, batch_tok = [], [], 0

    def _flush():
        nonlocal batch, batch_tok, out
        if not batch:
            return
        res = client.embeddings.create(model=EMBED_MODEL, input=batch)
        out.extend(np.asarray(d.embedding, dtype="float32") for d in res.data)
        batch, batch_tok = [], 0

    for txt in texts:
        tok = len(ENCODER.encode(txt))
        if batch_tok + tok > TOKEN_BUDGET:
            _flush()
        batch.append(txt)
        batch_tok += tok
    _flush()
    return out

# ──────────────────────────────────────────────────────────────────────────
def index_document(doc: Document):
    if not doc.content:
        return
    raw = (
        doc.content.decode("utf-8", errors="ignore")
        if isinstance(doc.content, (bytes, bytearray))
        else str(doc.content)
    )
    chunks, vectors = list(_split(raw)), _embed(list(_split(raw)))
    for i, (txt, vec) in enumerate(zip(chunks, vectors)):
        db.session.add(
            Embedding(
                document     = doc,
                chunk_index  = i,
                vector       = Embedding.pack(vec),
                text         = txt,
            )
        )
    db.session.commit()

# ──────────────────────────────────────────────────────────────────────────
def semantic_search(org_ids: list[int], query: str, k: int = 5):
    """
    Return up to *k* (score, Embedding) hits with cosine ≥ SIMILARITY_FLOOR.
    """
    q_vec = _embed([query])[0]
    qn    = np.linalg.norm(q_vec)

    vals = (
        Embedding.query
        .join(Document)
        .filter(Document.org_id.in_(org_ids))
        .all()
    )

    scored = []
    for e in vals:
        v = Embedding.unpack(e.vector)
        s = float(np.dot(q_vec, v) / (np.linalg.norm(v) * qn))
        if s >= SIMILARITY_FLOOR:
            scored.append((s, e))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:k]
