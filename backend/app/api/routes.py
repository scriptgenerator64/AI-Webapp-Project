from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import hashlib
from app.models import Organization, Document
from app import db
from app.utils.file_utils import allowed_file, extract_metadata
from app.services.document_processor import process_document_async

api_bp = Blueprint('api', __name__)

# Organization routes
@api_bp.route('/organizations', methods=['GET'])
def get_organizations():
    """Get all organizations"""
    organizations = Organization.query.all()
    return jsonify([org.to_dict() for org in organizations])

@api_bp.route('/organizations', methods=['POST'])
def create_organization():
    """Create a new organization"""
    data = request.json
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    # Check if organization with this name already exists
    existing = Organization.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Organization with this name already exists'}), 409
    
    org = Organization(
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(org)
    db.session.commit()
    
    return jsonify(org.to_dict()), 201

@api_bp.route('/organizations/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    """Get organization by ID"""
    org = Organization.query.get_or_404(org_id)
    return jsonify(org.to_dict())

@api_bp.route('/organizations/<int:org_id>', methods=['PUT'])
def update_organization(org_id):
    """Update organization"""
    org = Organization.query.get_or_404(org_id)
    data = request.json
    
    if 'name' in data:
        # Check if name is already taken by another organization
        existing = Organization.query.filter_by(name=data['name']).first()
        if existing and existing.id != org_id:
            return jsonify({'error': 'Organization with this name already exists'}), 409
        org.name = data['name']
    
    if 'description' in data:
        org.description = data['description']
    
    db.session.commit()
    return jsonify(org.to_dict())

@api_bp.route('/organizations/<int:org_id>', methods=['DELETE'])
def delete_organization(org_id):
    """Delete organization"""
    org = Organization.query.get_or_404(org_id)
    db.session.delete(org)
    db.session.commit()
    return '', 204

# Document routes
@api_bp.route('/organizations/<int:org_id>/documents', methods=['GET'])
def get_documents(org_id):
    """Get all documents for an organization"""
    Organization.query.get_or_404(org_id)  # Verify organization exists
    documents = Document.query.filter_by(organization_id=org_id).all()
    return jsonify([doc.to_dict() for doc in documents])

@api_bp.route('/organizations/<int:org_id>/documents', methods=['POST'])
def upload_document(org_id):
    """Upload a document to an organization"""
    org = Organization.query.get_or_404(org_id)
    
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Ensure unique filename
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(file_path):
            filename = f"{base}_{counter}{ext}"
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            counter += 1
        
        # Save the file
        file.save(file_path)
        
        # Calculate file hash
        file_hash = calculate_file_hash(file_path)
        
        # Extract metadata
        metadata = extract_metadata(file_path, file.content_type)
        
        # Create document record
        document = Document(
            name=filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=os.path.getsize(file_path),
            content_hash=file_hash,
            organization_id=org_id,
            embedding_status="pending"
        )
        document.set_metadata(metadata)
        
        db.session.add(document)
        db.session.commit()
        
        # Process document asynchronously (extract text and generate embeddings)
        process_document_async(document.id)
        
        return jsonify(document.to_dict()), 201
    
    return jsonify({'error': 'File type not allowed'}), 400

@api_bp.route('/documents/<int:doc_id>', methods=['GET'])
def get_document(doc_id):
    """Get document by ID"""
    document = Document.query.get_or_404(doc_id)
    return jsonify(document.to_dict())

@api_bp.route('/documents/<int:doc_id>', methods=['PUT'])
def update_document(doc_id):
    """Update document metadata"""
    document = Document.query.get_or_404(doc_id)
    data = request.json
    
    if 'name' in data:
        document.name = data['name']
    
    if 'metadata' in data and isinstance(data['metadata'], dict):
        # Update metadata while preserving existing fields
        metadata = document.get_metadata()
        metadata.update(data['metadata'])
        document.set_metadata(metadata)
    
    db.session.commit()
    return jsonify(document.to_dict())

@api_bp.route('/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete document"""
    document = Document.query.get_or_404(doc_id)
    
    # Delete the file
    try:
        os.remove(document.file_path)
    except OSError:
        # Log error but continue with database deletion
        current_app.logger.error(f"Error deleting file: {document.file_path}")
    
    # Delete from database
    db.session.delete(document)
    db.session.commit()
    
    return '', 204

def calculate_file_hash(file_path):
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    
    with open(file_path, "rb") as f:
        # Read and update hash in chunks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    return sha256_hash.hexdigest()
