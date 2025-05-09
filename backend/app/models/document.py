# backend/app/models.py
from datetime import datetime
from app.extensions import db

class Document(db.Model):
    __tablename__ = "documents"

    id         = db.Column(db.Integer, primary_key=True)
    org_id     = db.Column(db.Integer,
                           db.ForeignKey("organizations.id"),
                           nullable=False)
    filename   = db.Column(db.String(255), nullable=False)
    content    = db.Column(db.LargeBinary, nullable=False)
    hash       = db.Column(db.String(64), unique=True, nullable=False)

    # ✨ NEW — matches the arg the view already passes
    size_bytes = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organization = db.relationship("Organization",
                                   back_populates="documents")

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "org_id": self.org_id,
            "filename": self.filename,
            "size_bytes": self.size_bytes,
            "created_at": self.created_at.isoformat(),
        }
