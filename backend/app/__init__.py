"""
Flask app factory with zero-touch DB initialisation.

• Resolves the SQLite file to  backend/instance/app.db
• Creates the database + tables on first launch
• Registers blueprints automatically
"""
import os
from dotenv import load_dotenv
from pathlib import Path
from flask import Flask
from flask_cors import CORS

from .extensions import db
from .config import Config

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.conf'))

# ────────────────────────────────────────────────────────────────────────────────
def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS – open during dev
    CORS(app, supports_credentials=True, origins="*")

    # Init SQLAlchemy
    db.init_app(app)

    # Blueprints ---------------------------------------------------------------
    from .api.organizations import org_bp
    from .api.documents     import doc_bp
    # add others as you implement them
    from .api.chat import bp as chat_bp
    app.register_blueprint(chat_bp, url_prefix="/api")

    app.register_blueprint(org_bp, url_prefix="/api/organizations")
    app.register_blueprint(doc_bp, url_prefix="/api")

    # Create tables on first run ----------------------------------------------
    with app.app_context():
        # *import models here* so SQLAlchemy is aware of them
        from . import models  # noqa: F401  (side-effect import)
        db.create_all()

    return app


# ── Dev entry-point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Allows “python -m app” during dev
    create_app().run(debug=True, host="0.0.0.0", port=5000)
