# Standard library imports
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import os
import secrets
from flask import Flask, request, jsonify
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
from flask_session import Session

# Load environment variables
load_dotenv()

# Instantiate app
app = Flask(__name__)

# Set port
port = int(os.environ.get('FLASK_RUN_PORT', 5555))

# All configuration settings in one app.config.update call
app.config.update(
    # Secret keys
    SECRET_KEY=os.environ.get('SECRET_KEY'),
    WTF_CSRF_SECRET_KEY=os.environ.get('WTF_CSRF_SECRET_KEY'),

    # Database configuration
    SQLALCHEMY_DATABASE_URI=os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///app.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    
    # Enhanced Session settings
    SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_REFRESH_EACH_REQUEST=True,
    SESSION_COOKIE_PATH='/',
    SESSION_TYPE='filesystem',
    
    # CSRF settings
    WTF_CSRF_ENABLED=True,
    WTF_CSRF_CHECK_DEFAULT=True,
    WTF_CSRF_TIME_LIMIT=None,  # Remove CSRF token timeout
    WTF_CSRF_SSL_STRICT=False,  # Set to True in production
    WTF_CSRF_METHODS={'POST', 'PUT', 'PATCH', 'DELETE'},

    # Upload settings
    UPLOADED_IMAGES_DEST=os.environ.get('UPLOADED_IMAGES_DEST', 'uploads/images'),
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
    
    # Mail settings
    MAIL_SERVER=os.environ.get('MAIL_SERVER', 'smtp.gmail.com'),
    MAIL_PORT=int(os.environ.get('MAIL_PORT', 465)),
    MAIL_USE_TLS=os.environ.get('MAIL_USE_TLS', 'False').lower() == 'true',
    MAIL_USE_SSL=os.environ.get('MAIL_USE_SSL', 'True').lower() == 'true',
    MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.environ.get('MAIL_DEFAULT_SENDER'),
    
    # JSON settings
    JSON_SORT_KEYS=False,
    JSONIFY_PRETTYPRINT_REGULAR=True
)

app.json.compact = False

# Initialize Flask-Session
Session(app)

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

# Add CSRF token route
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf():
    token = generate_csrf()
    response = jsonify({'csrf_token': token})
    return response

# Handle CSRF errors
@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return jsonify({'error': 'CSRF token missing or incorrect'}), 400

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
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

CLOUDINARY_UPLOAD_PRESET = os.environ.get('CLOUDINARY_UPLOAD_PRESET')

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(level=logging.DEBUG)
app_logger = logging.getLogger('app')
app_logger.setLevel(logging.DEBUG)
app_logger.propagate = False

file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10, encoding='utf-8')
console_handler = logging.StreamHandler()

log_format = logging.Formatter(
    '%(asctime)s %(levelname)s [%(name)s] %(message)s [in %(pathname)s:%(lineno)d]'
)
file_handler.setFormatter(log_format)
console_handler.setFormatter(log_format)

app_logger.addHandler(file_handler)
app_logger.addHandler(console_handler)

if app.debug:
    file_handler.setLevel(logging.DEBUG)
    console_handler.setLevel(logging.DEBUG)
    app_logger.debug('Running in debug mode')
else:
    file_handler.setLevel(logging.INFO)
    console_handler.setLevel(logging.INFO)
    app_logger.info('Running in production mode')

app_logger.info('Application initialization completed')
