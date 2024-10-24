# Standard library imports
import os

# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_mail import Mail
import cloudinary

# Instantiate app, set attributes
app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Configure Flask-Uploads
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/images'
ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']
images = UploadSet('images', IMAGES)
configure_uploads(app, images)

# Define metadata with comprehensive naming convention
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
})

# Initialize SQLAlchemy with metadata
db = SQLAlchemy(metadata=metadata)

# Initialize Flask extensions
bcrypt = Bcrypt(app)
api = Api(app)
CORS(app)

# Initialize Flask-Migrate after SQLAlchemy
migrate = Migrate(app, db)
db.init_app(app)

# Configure Flask-Mail
app.config.update(
    MAIL_SERVER="smtp.gmail.com",
    MAIL_PORT=465,
    MAIL_USE_TLS=False,
    MAIL_USE_SSL=True,
    MAIL_USERNAME='campustextbookexchange@gmail.com',
    MAIL_PASSWORD='bkrb couo vrqn gdsq',  
    MAIL_DEFAULT_SENDER='campustextbookexchange@gmail.com'
)
mail = Mail(app)

# Secret key configuration
app.secret_key = 'your_secret_key_here'  

# Cloudinary configuration
cloudinary.config(
    cloud_name="duhjluee1",
    api_key="247538451127763",
    api_secret="oP9Qkj-5_o8fk8SGx0A8pybDtGs"  
)

CLOUDINARY_UPLOAD_PRESET = "unsigned"