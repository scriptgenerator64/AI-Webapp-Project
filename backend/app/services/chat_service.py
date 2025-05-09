import openai
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def generate_response(query, chunk_results, conversation_history=None):
    """
    Generate a response using OpenAI API with context from retrieved chunks
    
    Args:
        query: User query
        chunk_results: List of (chunk, score) tuples from vector search
        conversation_history: List of previous messages (optional)
        
    Returns:
        Tuple of (response_text, sources)
    """
    try:
        # Set API key
        openai.api_key = current_app.config.get('OPENAI_API_KEY')
        
        # Prepare context from chunks
        context = ""
        sources = []
        
        for chunk, score in chunk_results:
            if score &lt; 0.7:  # Skip low relevance chunks
                continue
                
            context += f"\n\nDocument: {chunk.document.name}\n"
            context += f"Content: {chunk.text}\n"
            
            # Add to sources
            sources.append({
                'document_id': chunk.document_id,
                'document_name': chunk.document.name,
                'organization_id': chunk.document.organization_id,
                'organization_name': chunk.document.organization.name,
                'text': chunk.text,
                'relevance_score': float(score)
            })
        
        # Prepare messages
        messages = []
        
        # System message with instructions
        system_message = f"""You are a helpful assistant that answers questions based on the provided document context.
        If the answer is not in the context, say you don't know and avoid making up information.
        Always cite your sources by referring to the document names.
        
        Context:
        {context}
        """
        
        messages.append({"role": "system", "content": system_message})
        
        # Add conversation history if provided
        if conversation_history:
            for message in conversation_history:
                messages.append({
                    "role": message.get("role", "user"),
                    "content": message.get("content", "")
                })
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        # Generate response
        response = openai.chat.completions.create(
            model=current_app.config.get('CHAT_MODEL', "gpt-4o"),
            messages=messages,
            temperature=0.3,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        return response_text, sources
        
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return "I'm sorry, I encountered an error while processing your request.", []
