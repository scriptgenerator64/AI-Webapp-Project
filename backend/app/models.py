"""
SQLAlchemy models for the RAG demo.
Add more columns as you need, but keep the minimal set here
so the UI can list organisations and their documents.
"""

from datetime import datetime
from .extensions import db


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # child rows
    documents = db.relationship(
        "Document", backref="organization", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Org {self.id}: {self.name}>"



class Document(db.Model):
    __tablename__ = "documents"
