# app/services/rag.py
from __future__ import annotations

import logging
from typing import List, Tuple

import numpy as np
from openai import OpenAI, OpenAIError

from .embeddings import semantic_search

log = logging.getLogger(__name__)

CHAT_MODEL          = "gpt-4o-mini"
MAX_CONTEXT_CHARS   = 12_000
SYSTEM_PROMPT = (
    "You answer questions about internal documents. "
    "Quote passages inside <<< >>>. "
    "Conclude with a line:\n"
    "Sources: docID-chunkIdx, …"
)

client = OpenAI()

# ─────────────────────────────────────────────────────────────────────────────
def _build_context(hits: List[Tuple[float, object]]) -> str:
    """
    Convert (score, Embedding) hits to a single context string:
        (doc 17-3) first 800 chars …
    """
    parts, total = [], 0
    for _score, chunk in hits:
        snippet = f"(doc {chunk.document_id}-{chunk.chunk_index}) {chunk.text[:800]}"
        parts.append(snippet)
        total += len(snippet)
        if total >= MAX_CONTEXT_CHARS:
            break
    return "\n\n---\n\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
def answer(org_ids: List[int], query: str, k: int = 5) -> Tuple[str, List[str]]:
    """
    Retrieve → augment → chat-complete.  Returns (answer, [source ids]).
    """
    hits = semantic_search(org_ids, query, k=k)

    if not hits:
        return (
            "I couldn’t find anything matching that question in the available "
            "documents. Please try rephrasing or upload more material.",
            [],
        )

    context = _build_context(hits)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": f"{context}\n\nQuestion: {query}"},
    ]

    try:
        chat = client.chat.completions.create(
            model       = CHAT_MODEL,
            messages    = messages,
            temperature = 0.2,
        )
        answer_text = chat.choices[0].message.content.strip()
    except OpenAIError:
        log.exception("OpenAI chat error while answering")
        return (
            "Sorry, I ran into a problem while generating the answer. "
            "Please try again in a minute.",
            [],
        )

    sources = [f"{chunk.document_id}-{chunk.chunk_index}" for _s, chunk in hits]
    return answer_text, sources
