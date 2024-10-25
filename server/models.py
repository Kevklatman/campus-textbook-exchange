from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.hybrid import hybrid_property 
from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, DateTime, func, BigInteger
from flask_login import UserMixin
from flask_bcrypt import generate_password_hash, check_password_hash
from config import db
import re
from cloudinary.utils import cloudinary_url


class User(db.Model, SerializerMixin, UserMixin):
    __tablename__ = "users"

    serialize_only = ('id', 'email', 'name')

    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(255), unique=True, nullable=False)
    name = db.Column(String)
    _password_hash = db.Column(db.String)

    posts = relationship('Post', back_populates='user', cascade="all, delete-orphan")
    comments = relationship('Comment', back_populates='user', cascade="all, delete-orphan")
    watchlists = relationship('Watchlist', back_populates='user', cascade="all, delete-orphan")
    notifications = relationship('Notification', back_populates='user', cascade="all, delete-orphan")


    textbooks = relationship('Textbook', secondary='posts', viewonly=True)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

    @validates('email')
    def validate_email(self, key, email):
        return User.validate_email_format(email)

    @staticmethod
    def validate_email_format(email):
        if not isinstance(email, str):
            raise ValueError("Email must be a string.")
        if not re.fullmatch(r'^[^@]+@[^@]+\.[eE][dD][uU]$', email):
            raise ValueError("Email must contain '@' and end with '.edu'.")
        return email

    @property
    def password_hash(self):
        return self._password_hash
    
    @password_hash.setter
    def password_hash(self, plain_text_password):
        if plain_text_password is None:
            raise ValueError("Password cannot be None")
        self._password_hash = generate_password_hash(plain_text_password).decode('utf-8')
    
    def authenticate(self, password):
        return check_password_hash(self._password_hash, password)

class Textbook(db.Model, SerializerMixin):
    __tablename__ = "textbooks"

    serialize_only = ('id', 'author', 'title', 'isbn', 'subject')

    id = db.Column(Integer, primary_key=True)
    author = db.Column(String)
    title = db.Column(String)
    subject = db.Column(String)
    isbn = db.Column(BigInteger, nullable=False)

    posts = relationship('Post', back_populates='textbook', cascade="all, delete-orphan")
    watchlists = relationship('Watchlist', back_populates='textbook', cascade="all, delete-orphan")

    # Define a relationship to User through Post
    users = relationship('User', secondary='posts', viewonly=True)

    __table_args__ = (
        CheckConstraint('isbn >= 1000000000000 AND isbn < 10000000000000', name='check_isbn_length'),
    )

    def __repr__(self):
        return f"<Textbook(id={self.id}, title={self.title}, author={self.author})>"

    @validates('isbn')
    def validate_isbn(self, key, isbn):
        return self._validate_isbn(isbn)

    @staticmethod
    def _validate_isbn(isbn):
        if not isinstance(isbn, int):
            raise ValueError("ISBN must be an integer.")
        if not (1000000000000 <= isbn < 10000000000000):
            raise ValueError("ISBN must be a 13-digit integer.")
        return isbn

    @classmethod
    def validate_isbn(cls, isbn):
        return cls._validate_isbn(isbn)

class Comment(db.Model, SerializerMixin):
    __tablename__ = "comments"

    serialize_rules = ('-user.comments', '-post.comments')

    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = db.Column(Integer, ForeignKey('posts.id'), nullable=False)
    text = db.Column(String, nullable=False)
    created_at = db.Column(DateTime, server_default=func.now())

    user = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')

    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, post_id={self.post_id})>"

class Post(db.Model, SerializerMixin):
    __tablename__ = "posts"

    serialize_only = ('id', 'textbook_id', 'user_id', 'price', 'condition', 'created_at', 'img', 'image_url')

    id = db.Column(Integer, primary_key=True)
    textbook_id = db.Column(Integer, ForeignKey('textbooks.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    price = db.Column(Integer)
    condition = db.Column(String)
    created_at = db.Column(DateTime, server_default=func.now())
    img = db.Column(db.String, nullable=True)  # This now stores the Cloudinary public ID
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    user = relationship('User', back_populates='posts')
    textbook = relationship('Textbook', back_populates='posts')
    comments = relationship('Comment', back_populates='post', cascade="all, delete-orphan")
    watchlists = relationship('Watchlist', back_populates='post', cascade="all, delete-orphan")
    notifications = relationship('Notification', back_populates='post', cascade="all, delete-orphan")


    def __repr__(self):
        return f"<Post(id={self.id}, textbook_id={self.textbook_id}, user_id={self.user_id}, price={self.price})>"

    def get_image_url(self):
        if self.img:
            return cloudinary_url(self.img)[0]  # cloudinary_url returns a tuple (url, options)
        return None

    @property
    def image_url(self):
        return self.get_image_url()

    def to_dict(self):
        dict_repr = super().to_dict()
        dict_repr['image_url'] = self.image_url
        return dict_repr
    
    

class Watchlist(db.Model, SerializerMixin):
    __tablename__ = "watchlists"

    serialize_rules = ('-post.watchlists', '-textbook.watchlists', '-user.watchlists')
    serialize_only = ('id', 'user_id', 'post_id', 'textbook_id')

    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'))
    post_id = db.Column(Integer, ForeignKey('posts.id'))
    textbook_id = db.Column(Integer, ForeignKey('textbooks.id'))

    user = relationship('User', back_populates='watchlists')
    post = relationship('Post', back_populates='watchlists')
    textbook = relationship('Textbook', back_populates='watchlists')

    def __repr__(self):
        return f"<Watchlist(id={self.id}, user_id={self.user_id}, post_id={self.post_id}, textbook_id={self.textbook_id})>"
    
class Notification(db.Model, SerializerMixin):
    __tablename__ = "notifications"

    serialize_only = ('id', 'user_id', 'post_id', 'message', 'created_at', 'read')

    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = db.Column(Integer, ForeignKey('posts.id'), nullable=False)
    message = db.Column(String, nullable=False)
    created_at = db.Column(DateTime, server_default=func.now())
    read = db.Column(db.Boolean, default=False)

    user = relationship('User', back_populates='notifications')
    post = relationship('Post', back_populates='notifications')

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, read={self.read})>"