from datetime import datetime
import json
from app import db

class Document(db.Model):
    """Document model"""
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    content_hash = db.Column(db.String(64), nullable=False)  # SHA-256 hash
    metadata = db.Column(db.Text, nullable=True)  # JSON string for metadata
    text_content = db.Column(db.Text, nullable=True)  # Extracted text content
    embedding_status = db.Column(db.String(20), default="pending")  # pending, processing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    
    # Relationships
    organization = db.relationship('Organization', back_populates='documents')
    chunks = db.relationship('Chunk', back_populates='document', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Document {self.name}>'
    
    def set_metadata(self, metadata_dict):
        """Set metadata as JSON string"""
        self.metadata = json.dumps(metadata_dict)
    
    def get_metadata(self):
        """Get metadata as dictionary"""
        if self.metadata:
            return json.loads(self.metadata)
        return {}
    
    def to_dict(self):
        """Convert document to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'organization_id': self.organization_id,
            'organization_name': self.organization.name if self.organization else None,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'content_hash': self.content_hash,
            'embedding_status': self.embedding_status,
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
