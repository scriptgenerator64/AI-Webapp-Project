from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / 'instance' / 'app.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = BASE_DIR / "uploads"
    UPLOAD_FOLDER.mkdir(exist_ok=True, parents=True)

    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
