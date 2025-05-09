from .. import db
from datetime import datetime

class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    hash = db.Column(db.String(64), nullable=False)
    metadata = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    content = db.Column(db.Text, nullable=True)  # plaintext cache

    organization = db.relationship("Organization", back_populates="documents")
