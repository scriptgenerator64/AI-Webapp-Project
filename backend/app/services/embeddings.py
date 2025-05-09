import numpy as np, tiktoken
from openai import OpenAI
from ..models import Embedding, Document
from .. import db

EMBED_MODEL = "text-embedding-3-small"
TOKEN_LIMIT = 800
ENCODER = tiktoken.encoding_for_model("gpt-4o-mini")
client = OpenAI()

# ------------------------------------------------------------------ #
def _split(text: str, max_tokens: int = TOKEN_LIMIT):
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
    res = client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [np.asarray(d.embedding, dtype="float32") for d in res.data]

# ------------------------------------------------------------------ #
def index_document(doc: Document):
    if not doc.content:
        return
    chunks = list(_split(doc.content))
    vectors = _embed(chunks)
    for i, (txt, vec) in enumerate(zip(chunks, vectors)):
        db.session.add(
            Embedding(
                document=doc,
                chunk_index=i,
                vector=Embedding.pack(vec),
                text=txt,
            )
        )
    db.session.commit()

def semantic_search(org_ids: list[int], query: str, k: int = 5):
    q_vec = _embed([query])[0]
    qn = np.linalg.norm(q_vec)

    cands = (
        Embedding.query.join(Document)
        .filter(Document.org_id.in_(org_ids))
        .all()
    )

    scored = []
    for e in cands:
        v = Embedding.unpack(e.vector)
        s = float(np.dot(q_vec, v) / (np.linalg.norm(v) * qn))
        scored.append((s, e))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:k]
