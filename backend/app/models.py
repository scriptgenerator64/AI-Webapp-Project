from datetime import datetime
from .extensions import db

class Organization(db.Model):
    __tablename__ = "organizations"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(255), nullable=False, unique=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ── children
    documents   = db.relationship(
        "Document", backref="organization", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Org {self.id}:{self.name}>"

class Document(db.Model):
    __tablename__ = "documents"

    id          = db.Column(db.Integer, primary_key=True)
    org_id      = db.Column(db.Integer,
                            db.ForeignKey("organizations.id", ondelete="CASCADE"),
                            nullable=False)
    filename    = db.Column(db.String(260), nullable=False)
    content     = db.Column(db.LargeBinary, nullable=False)      # raw bytes
    hash        = db.Column(db.String(64), nullable=False)
    size_bytes  = db.Column(db.Integer, nullable=False)
    metadata    = db.Column(db.JSON, nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (db.UniqueConstraint("org_id", "hash"),)

    def __repr__(self):
        return f"<Doc {self.id}:{self.filename}>"
    
    def as_dict(self):
        return {
            "id":         self.id,
            "org_id":     self.org_id,
            "filename":   self.filename,
            "size_bytes": self.size_bytes,
            "created_at": self.created_at.isoformat()
        }
