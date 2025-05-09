from flask import Blueprint, request, jsonify, current_app
from app.models import Organization, Document, Chunk
from app.services.embedding_service import get_embedding
from app.services.vector_search import search_chunks
from sqlalchemy import or_

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['POST'])
def search_documents():
    """Search documents across organizations using semantic similarity"""
    data = request.json
    
    if not data or 'query' not in data:
        return jsonify({'error': 'Query is required'}), 400
    
    query = data['query']
    org_ids = data.get('organization_ids', [])
    limit = data.get('limit', 10)
    
    # Validate organization IDs if provided
    if org_ids:
        for org_id in org_ids:
            org = Organization.query.get(org_id)
            if not org:
                return jsonify({'error': f'Organization with ID {org_id} not found'}), 404
    
    try:
        # Get embedding for the query
        query_embedding = get_embedding(query)
        
        # Search for relevant chunks
        results = search_chunks(query_embedding, org_ids, limit)
        
        # Format results
        formatted_results = []
        for chunk, score in results:
            formatted_results.append({
                'chunk_id': chunk.id,
                'document_id': chunk.document_id,
                'document_name': chunk.document.name,
                'organization_id': chunk.document.organization_id,
                'organization_name': chunk.document.organization.name,
                'text': chunk.text,
                'relevance_score': float(score)
            })
        
        return jsonify({
            'query': query,
            'results': formatted_results
        })
    
    except Exception as e:
        current_app.logger.error(f"Error in search: {str(e)}")
        return jsonify({'error': 'An error occurred during search'}), 500
