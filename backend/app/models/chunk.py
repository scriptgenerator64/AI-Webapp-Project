from app import db
import numpy as np
import json

class Chunk(db.Model):
    """Document chunk model for vector search"""
    __tablename__ = 'chunks'
    
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    chunk_index = db.Column(db.Integer, nullable=False)  # Index of the chunk within the document
    text = db.Column(db.Text, nullable=False)  # The chunk text
    embedding = db.Column(db.Text, nullable=True)  # JSON string of embedding vector
    
    # Relationships
    document = db.relationship('Document', back_populates='chunks')
    
    def __repr__(self):
        return f'<Chunk {self.id} of Document {self.document_id}>'
    
    def set_embedding(self, embedding_array):
        """Set embedding from numpy array"""
        if embedding_array is not None:
            self.embedding = json.dumps(embedding_array.tolist())
    
    def get_embedding(self):
        """Get embedding as numpy array"""
        if self.embedding:
            return np.array(json.loads(self.embedding))
        return None
    
    def to_dict(self):
        """Convert chunk to dictionary"""
        return {
            'id': self.id,
            'document_id': self.document_id,
            'document_name': self.document.name if self.document else None,
            'chunk_index': self.chunk_index,
            'text': self.text,
            'has_embedding': self.embedding is not None
        }
