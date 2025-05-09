import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.models import Chunk, Document
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def search_chunks(query_embedding, org_ids=None, limit=10):
    """
    Search for chunks similar to the query embedding
    
    Args:
        query_embedding: Numpy array of query embedding
        org_ids: List of organization IDs to search in (optional)
        limit: Maximum number of results to return
        
    Returns:
        List of (chunk, score) tuples sorted by relevance
    """
    # Get all chunks with embeddings
    query = Chunk.query.join(Document).filter(Chunk.embedding.isnot(None))
    
    # Filter by organization if specified
    if org_ids and len(org_ids) > 0:
        query = query.filter(Document.organization_id.in_(org_ids))
    
    chunks = query.all()
    
    if not chunks:
        logger.warning("No chunks found with embeddings")
        return []
    
    # Calculate similarity scores
    results = []
    for chunk in chunks:
        chunk_embedding = chunk.get_embedding()
        if chunk_embedding is not None:
            # Reshape embeddings for cosine_similarity
            query_embedding_reshaped = query_embedding.reshape(1, -1)
            chunk_embedding_reshaped = chunk_embedding.reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(query_embedding_reshaped, chunk_embedding_reshaped)[0][0]
            results.append((chunk, similarity))
    
    # Sort by similarity score (descending)
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Return top results
    return results[:limit]
