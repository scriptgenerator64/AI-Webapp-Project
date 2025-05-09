from flask import Blueprint, request, jsonify, current_app
from app.models import Organization, Document, Chunk
from app.services.embedding_service import get_embedding
from app.services.vector_search import search_chunks
from app.services.chat_service import generate_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """Chat with AI about documents"""
    data = request.json
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    message = data['message']
    org_ids = data.get('organization_ids', [])
    conversation_history = data.get('conversation_history', [])
    
    # Validate organization IDs if provided
    if org_ids:
        for org_id in org_ids:
            org = Organization.query.get(org_id)
            if not org:
                return jsonify({'error': f'Organization with ID {org_id} not found'}), 404
    
    try:
        # Get embedding for the query
        query_embedding = get_embedding(message)
        
        # Search for relevant chunks
        chunk_results = search_chunks(query_embedding, org_ids, limit=5)
        
        # Generate response using OpenAI
        response, sources = generate_response(message, chunk_results, conversation_history)
        
        # Format sources
        formatted_sources = []
        for source in sources:
            formatted_sources.append({
                'document_id': source['document_id'],
                'document_name': source['document_name'],
                'organization_id': source['organization_id'],
                'organization_name': source['organization_name'],
                'excerpt': source['text'],
                'relevance': source['relevance_score']
            })
        
        return jsonify({
            'message': message,
            'response': response,
            'sources': formatted_sources
        })
    
    except Exception as e:
        current_app.logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': 'An error occurred during chat processing'}), 500
