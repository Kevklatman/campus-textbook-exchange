# Standard library imports
import os
import secrets
from flask import Flask, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_mail import Mail
import cloudinary
from flask_wtf.csrf import CSRFProtect, generate_csrf, CSRFError
from datetime import timedelta

# Generate strong secret keys
SECRET_KEY = secrets.token_hex(32)
WTF_CSRF_SECRET_KEY = secrets.token_hex(32)

# Instantiate app
app = Flask(__name__)

# Critical Security Configuration
app.config.update(
    # Secret keys
    SECRET_KEY=SECRET_KEY,
    WTF_CSRF_SECRET_KEY=WTF_CSRF_SECRET_KEY,

    # Database configuration
    SQLALCHEMY_DATABASE_URI='sqlite:///app.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    
    # Session settings
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_REFRESH_EACH_REQUEST=True,
    SESSION_COOKIE_PATH='/',
    
    # CSRF settings
    WTF_CSRF_ENABLED=True,
    WTF_CSRF_CHECK_DEFAULT=True,
    WTF_CSRF_TIME_LIMIT=None,
    WTF_CSRF_SSL_STRICT=True,
    WTF_CSRF_METHODS={'POST', 'PUT', 'PATCH', 'DELETE'},

    # Upload settings
    UPLOADED_IMAGES_DEST='uploads/images',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
    
    # Mail settings
    MAIL_SERVER="smtp.gmail.com",
    MAIL_PORT=465,
    MAIL_USE_TLS=False,
    MAIL_USE_SSL=True,
    MAIL_USERNAME='campustextbookexchange@gmail.com',
    MAIL_PASSWORD='bkrb couo vrqn gdsq',
    MAIL_DEFAULT_SENDER='campustextbookexchange@gmail.com',
    
    # JSON settings
    JSON_SORT_KEYS=False,
    JSONIFY_PRETTYPRINT_REGULAR=True
)

app.json.compact = False

# Define metadata with naming convention
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
})

# Initialize extensions
db = SQLAlchemy(metadata=metadata)
bcrypt = Bcrypt(app)
api = Api(app)
mail = Mail(app)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-CSRF-Token"],
        "expose_headers": ["X-CSRF-Token"],
        "supports_credentials": True
    }
})



# Initialize CSRF protection
csrf = CSRFProtect(app)
csrf.exempt('csrf_token')  # Exempt the token route

# Configure uploads
ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']
images = UploadSet('images', IMAGES)
configure_uploads(app, images)

# Initialize migrations
migrate = Migrate(app, db)
db.init_app(app)

# Cloudinary configuration
cloudinary.config(
    cloud_name="duhjluee1",
    api_key="247538451127763",
    api_secret="oP9Qkj-5_o8fk8SGx0A8pybDtGs"
)

CLOUDINARY_UPLOAD_PRESET = "unsigned"





