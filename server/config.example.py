from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Flask configuration
class Config:
    # Secret key should be set in environment variable
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    
    # Other configurations
    DEBUG = os.environ.get('FLASK_DEBUG', '0') == '1'
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
