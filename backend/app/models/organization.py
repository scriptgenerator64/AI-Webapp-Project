from .. import db
from datetime import datetime

class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    documents = db.relationship(
        "Document",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Org {self.id}:{self.name}>"
