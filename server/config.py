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

# Local imports

# Instantiate app, set attributes
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Configure Flask-Uploads
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/images'  # Set the destination directory
ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']
images = UploadSet('images', IMAGES)
configure_uploads(app, images)  # Configure the app with the upload set

# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app)

# Instantiate Bcrypt
bcrypt = Bcrypt(app)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = "smtp.gmail.com"  
app.config['MAIL_PORT'] = 465  
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = ('campustextbookexchange@gmail.com')  
app.config['MAIL_PASSWORD'] = ('')  #from kevin to kevin, remember to update this when running/ demonstrating app
app.config['MAIL_DEFAULT_SENDER'] = ('campustextbookexchange@gmail.com')  

# Instantiate Flask-Mail
mail = Mail(app)

app.secret_key = 'your_secret_key_here'

cloudinary.config(
    cloud_name = "duhjluee1",
    api_key = "247538451127763",
    api_secret = "oP9Qkj-5_o8fk8SGx0A8pybDtGs"
)

CLOUDINARY_UPLOAD_PRESET = "unsigned"
