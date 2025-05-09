from flask import Blueprint
bp = Blueprint("api", __name__)

from . import organizations, documents, search, chat   # noqa
