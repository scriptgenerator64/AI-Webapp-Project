"""
Shared third-party extensions (only SQLAlchemy for now).

Putting them in a separate module avoids circular imports when models
and blueprints need the `db` object.
"""

from flask_sqlalchemy import SQLAlchemy

# One global SQLAlchemy instance ─ initialised by create_app()
db: SQLAlchemy = SQLAlchemy()
