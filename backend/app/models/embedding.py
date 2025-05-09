from .. import db
import numpy as np
import pickle

class Embedding(db.Model):
    __tablename__ = "embeddings"

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id"), index=True)
    chunk_index = db.Column(db.Integer, nullable=False)
    vector = db.Column(db.LargeBinary, nullable=False)   # pickled float32 numpy
    text = db.Column(db.Text, nullable=False)

    document = db.relationship("Document", backref="embeddings")

    # helpers ----------------------------------------------------------
    @staticmethod
    def pack(v: np.ndarray) -> bytes:
        return pickle.dumps(v.astype("float32"), protocol=4)

    @staticmethod
    def unpack(b: bytes) -> np.ndarray:
        return pickle.loads(b)
