from .. import db
from datetime import datetime

class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    hash = db.Column(db.String(64), nullable=False)

    # ⚠️  rename here
    meta = db.Column(db.JSON, nullable=True)        # was `metadata`

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    content = db.Column(db.Text, nullable=True)

    organization = db.relationship("Organization", back_populates="documents")
    
    def as_dict(self):
        """
        Return a dict of all column values, converting datetimes
        to ISO‐format strings.
        """
        result = {}
        for col in self.__table__.columns:
            val = getattr(self, col.name)
            if isinstance(val, datetime):
                val = val.isoformat()
            result[col.name] = val
        return result