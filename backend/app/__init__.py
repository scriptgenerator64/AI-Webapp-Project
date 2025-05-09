import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.conf'))

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)

    # blueprints
    from .api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
