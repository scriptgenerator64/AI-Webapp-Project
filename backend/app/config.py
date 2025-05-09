"""
Central configuration for the Flask backend.

Key improvements
----------------
1.  **Guaranteed SQLite path** – we create the `backend/instance/`
    folder before SQLAlchemy connects, eliminating the
    `sqlite3.OperationalError: unable to open database file`.

2.  **Uploads folder** – still created on start-up so file
    uploads never fail.

3.  **Env support** – keeps the existing `OPENAI_API_KEY` lookup
    (add more secrets to your `.env.conf` as needed).
"""

from pathlib import Path
import os

# ────────────────────────────────────────────────────────────────────────────────
# Paths
# ────────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent           # …/backend
INSTANCE_DIR = BASE_DIR / "instance"
UPLOAD_DIR   = BASE_DIR / "uploads"

# Ensure the two writable folders exist *before* anything else touches them.
INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ────────────────────────────────────────────────────────────────────────────────
# Core settings
# ────────────────────────────────────────────────────────────────────────────────
class Config:
    # Absolute path → works no matter where `flask run` is executed
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{INSTANCE_DIR / 'app.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads
    UPLOAD_FOLDER = UPLOAD_DIR

    # Third-party keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
