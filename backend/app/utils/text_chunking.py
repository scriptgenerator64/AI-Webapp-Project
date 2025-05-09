import re
import logging

logger = logging.getLogger(__name__)

def chunk_text(text, chunk_size=1000, chunk_overlap=200):
    """Split text into overlapping chunks"""
    if not text:
        return []
    
    # Clean the text
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Split text into sentences
    sentences = re.split(r'(?&lt;=[.!?])\s+', text)
    
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence_size = len(sentence)
        
        # If adding this sentence would exceed the chunk size,
        # save the current chunk and start a new one
        if current_size + sentence_size > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            
            # Keep some sentences for overlap
            overlap_sentences = []
            overlap_size = 0
            
            # Work backwards through current_chunk to build overlap
            for s in reversed(current_chunk):
                if overlap_size + len(s) &lt;= chunk_overlap:
                    overlap_sentences.insert(0, s)
                    overlap_size += len(s) + 1  # +1 for the space
                else:
                    break
            
            current_chunk = overlap_sentences
            current_size = overlap_size
        
        current_chunk.append(sentence)
        current_size += sentence_size + 1  # +1 for the space
    
    # Add the last chunk if it's not empty
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks
