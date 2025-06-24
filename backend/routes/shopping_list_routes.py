from flask import Blueprint, request, jsonify
from ..db import db

shopping_list_bp = Blueprint('shopping_list_bp', __name__, url_prefix='/shopping-list')
