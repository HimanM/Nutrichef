import os
from backend.utils.logging_utils import log_info, log_success, log_warning

class Config:
    DB_USER = os.environ.get('DB_USER')
    DB_PASS = os.environ.get('DB_PASS')
    DB_HOST = os.environ.get('DB_HOST')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME')

    if DB_USER and DB_PASS and DB_HOST and DB_NAME:
        SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        log_success(f"Database URI configured: mysql+mysqlconnector://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}", "Config")
    else:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+mysqlconnector://root:@localhost/nutrichef_db')
        log_warning(f"Using default database URI: {SQLALCHEMY_DATABASE_URI}", "Config")
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    if GEMINI_API_KEY:
        log_success("GEMINI_API_KEY loaded successfully.", "Config")
    else:
        log_warning("GEMINI_API_KEY not found in environment variables.", "Config")
        
    PROJECT_NUMBER = os.environ.get('PROJECT_NUMBER')
    
    @classmethod
    def get_db_connection_params(cls):
        """
        Get database connection parameters for health checks.
        Returns a dictionary with connection parameters.
        """
        return {
            'host': cls.DB_HOST or 'localhost',
            'port': int(cls.DB_PORT or '3306'),
            'user': cls.DB_USER or 'root',
            'password': cls.DB_PASS or '',
            'database': cls.DB_NAME or 'nutrichef_db'
        }
