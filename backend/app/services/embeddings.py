"""
Vector-store helpers: split text → get OpenAI embeddings → persist & search.
"""

from __future__ import annotations

import numpy as np
import tiktoken
from openai import OpenAI
from ..models import Embedding, Document
from .. import db

# ─────────────────────────────────────────────────────────────────────────────
EMBED_MODEL   = "text-embedding-3-small"
TOKEN_LIMIT   = 800
ENCODER       = tiktoken.encoding_for_model("gpt-4o-mini")
client        = OpenAI()

# ─────────────────────────────────────────────────────────────────────────────
def _split(text: str, max_tokens: int = TOKEN_LIMIT):
    """
    Greedy whitespace splitter that tries to stay under *max_tokens*
    per chunk.  Uses the same encoder the embed model sees.
    """
    words, chunk, tokens = text.split(), [], 0
    for w in words:
        t = len(ENCODER.encode(w + " "))
        if tokens + t > max_tokens:
            yield " ".join(chunk)
            chunk, tokens = [], 0
        chunk.append(w)
        tokens += t
    if chunk:
        yield " ".join(chunk)


def _embed(texts: list[str]) -> list[np.ndarray]:
    """Call the OpenAI embeddings endpoint and return float32 vectors."""
    res = client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [np.asarray(d.embedding, dtype="float32") for d in res.data]


# ─────────────────────────────────────────────────────────────────────────────
def index_document(doc: Document):
    """
    Chunk *doc.content*, embed each chunk, and insert into the
    `embeddings` table.  Safe to call immediately after the document is
    committed.
    """
    if not doc.content:
        return

    # raw DB blob → utf-8 string (drop undecodable bytes)
    if isinstance(doc.content, (bytes, bytearray)):
        raw = doc.content.decode("utf-8", errors="ignore")
    else:
        raw = str(doc.content)

    chunks  = list(_split(raw))
    vectors = _embed(chunks)

    for i, (txt, vec) in enumerate(zip(chunks, vectors)):
        db.session.add(
            Embedding(
                document    = doc,
                chunk_index = i,
                vector      = Embedding.pack(vec),
                text        = txt,
            )
        )
    db.session.commit()


# ─────────────────────────────────────────────────────────────────────────────
def semantic_search(org_ids: list[int], query: str, k: int = 5):
    """
    Return the *k* highest-scoring (score, Embedding) tuples drawn from
    the specified organisations.
    """
    q_vec = _embed([query])[0]
    qn    = np.linalg.norm(q_vec)

    # candidate set
    cands = (
        Embedding.query
        .join(Document)
        .filter(Document.org_id.in_(org_ids))
        .all()
    )

    # cosine similarity
    scored = []
    for e in cands:
        v = Embedding.unpack(e.vector)
        sim = float(np.dot(q_vec, v) / (np.linalg.norm(v) * qn))
        scored.append((sim, e))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:k]
