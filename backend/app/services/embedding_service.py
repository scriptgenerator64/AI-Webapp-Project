import numpy as np
import openai
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def get_embedding(text):
    """Get embedding for text using OpenAI API"""
    if not text:
        return np.zeros(current_app.config.get('EMBEDDING_DIMENSION', 1536))
    
    # Truncate text if it's too long (OpenAI has token limits)
    # This is a simple character-based truncation, a more sophisticated
    # approach would use a tokenizer
    max_chars = 8000  # Approximate limit
    if len(text) > max_chars:
        text = text[:max_chars]
    
    try:
        # Set API key
        openai.api_key = current_app.config.get('OPENAI_API_KEY')
        
        # Get embedding from OpenAI
        response = openai.embeddings.create(
            model=current_app.config.get('EMBEDDING_MODEL', "text-embedding-3-small"),
            input=text
        )
        
        # Extract embedding from response
        embedding = response.data[0].embedding
        
        return np.array(embedding)
    
    except Exception as e:
        logger.error(f"Error getting embedding: {str(e)}")
        # Return zero vector as fallback
        return np.zeros(current_app.config.get('EMBEDDING_DIMENSION', 1536))
