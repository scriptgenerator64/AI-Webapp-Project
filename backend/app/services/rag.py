from openai import OpenAI
from .embeddings import semantic_search

CHAT_MODEL = "gpt-4o-mini"
client = OpenAI()

SYSTEM = """You answer questions about internal documents.
Quote passages inside <<< >>>. Conclude with a line:
Sources: docID-chunkIdx, ..."""

def answer(org_ids: list[int], query: str, k: int = 5):
    hits = semantic_search(org_ids, query, k)
    context = "\n\n---\n\n".join(
        f"(doc {e.document_id}-{e.chunk_index}) {e.text[:800]}"
        for _, e in hits
    )

    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": context + f"\n\nQuestion: {query}"},
    ]
    chat = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.2,
    )
    answer = chat.choices[0].message.content
    sources = [f"{e.document_id}-{e.chunk_index}" for _, e in hits]
    return answer, sources
