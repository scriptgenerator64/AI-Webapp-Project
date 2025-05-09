# app/services/rag.py
from __future__ import annotations

import logging
from typing import List, Tuple

import numpy as np
from openai import OpenAI, OpenAIError

from .embeddings import semantic_search

log = logging.getLogger(__name__)

CHAT_MODEL = "gpt-4o-mini"          # change in one place later if needed
MAX_CONTEXT_CHARS = 12_000          # keep the prompt safe for gpt-4o-mini
SYSTEM_PROMPT = (
    "You answer questions about internal documents. "
    "Quote passages inside <<< >>>. "
    "Conclude with a line:\n"
    "Sources: docID-chunkIdx, …"
)

client = OpenAI()


def _build_context(hits: list[Tuple[float, object]]) -> str:
    """
    Turn the search hits into a single string:
        (doc 17-3) first 800 chars…
    Trim at MAX_CONTEXT_CHARS so the chat prompt never blows up.
    """
    contexts: List[str] = []
    total = 0
    for _score, chunk in hits:
        snippet = f"(doc {chunk.document_id}-{chunk.chunk_index}) {chunk.text[:800]}"
        contexts.append(snippet)
        total += len(snippet)
        if total >= MAX_CONTEXT_CHARS:
            break
    return "\n\n---\n\n".join(contexts)


def answer(org_ids: List[int], query: str, k: int = 5) -> Tuple[str, List[str]]:
    """
    Retrieve the top-k most relevant document chunks for *org_ids* and
    ask the chat model to answer *query*.

    Returns
    -------
    answer : str
        The model’s answer, including quoted passages.
    sources : list[str]
        A list like ["17-3", "9-1", …] that front-end can render.
    """
    hits = semantic_search(org_ids, query, k=k) or []

    if not hits:
        return (
            "I couldn’t find anything matching that question in the available "
            "documents. Please try rephrasing or upload more material.",
            [],
        )

    context = _build_context(hits)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"{context}\n\nQuestion: {query}"},
    ]

    try:
        chat = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=0.2,
        )
        answer_text = chat.choices[0].message.content.strip()
    except OpenAIError as exc:
        log.exception("OpenAI chat error")
        return (
            "Sorry, I ran into a problem while generating the answer. "
            "Please try again in a minute.",
            [],
        )

    sources = [f"{chunk.document_id}-{chunk.chunk_index}" for _s, chunk in hits]
    return answer_text, sources
