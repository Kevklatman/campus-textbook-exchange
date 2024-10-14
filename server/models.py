from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.hybrid import hybrid_property 
from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, DateTime, func, BigInteger
from config import db, bcrypt
from flask_login import UserMixin
import re

class User(db.Model, SerializerMixin, UserMixin):
    __tablename__ = "users"

    serialize_only = ('id', 'email', 'name')

    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(255), unique=True, nullable=False)
    name = db.Column(String)
    _password_hash = db.Column(db.String)

    posts = relationship('Post', back_populates='user')
    comments = relationship('Comment', back_populates='user')
    watchlist_textbooks = association_proxy('watchlists', 'textbook')

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

    @staticmethod
    def validate_email(email):
        """Validate that the email contains '@' and ends with '.edu'."""
        if not isinstance(email, str):
            raise ValueError("Email must be a string.")
        if not re.fullmatch(r'^[^@]+@[^@]+\.[eE][dD][uU]$', email):
            raise ValueError("Email must contain '@' and end with '.edu'.")
        

        #This will allow us to set password_hash directly inside the sqlite database. 
    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hashes may not be viewed.")
    
    @password_hash.setter 
    def password_hash(self,password):
        #generate_passwoord_hash is a boiler plate(a built in) method that is given to us by bycrpt that encrypts plaintext 
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        #the decode will make the password shorter in the database 
        # Hash the password and store it
        self._password_hash = password_hash.decode('utf-8')
    
    def authenticate(self, password):
        #using a built in bcrypt method. This returns True or False
        # Check if the provided password matches the hashed password
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

class Textbook(db.Model, SerializerMixin):
    __tablename__ = "textbooks"

    serialize_only = ('id', 'author', 'title', 'isbn', 'img')

    id = db.Column(Integer, primary_key=True)
    author = db.Column(String)
    title = db.Column(String)
    subject = db.Column(String)
    isbn = db.Column(BigInteger, nullable=False)
    img = db.Column(String)

    posts = relationship('Post', back_populates='textbook', cascade="all, delete-orphan")
    watchlists = relationship('Watchlist', back_populates='textbook')

    __table_args__ = (
        CheckConstraint('isbn >= 1000000000000 AND isbn < 10000000000000', name='check_isbn_length'),
    )

    def __repr__(self):
        return f"<Textbook(id={self.id}, title={self.title}, author={self.author})>"

    @staticmethod
    def validate_isbn(isbn):
        """Validate that the ISBN is a 13-digit integer."""
        if not isinstance(isbn, int):
            raise ValueError("ISBN must be an integer.")
        if not (1000000000000 <= isbn < 10000000000000):
            raise ValueError("ISBN must be a 13-digit integer.")
        

    @validates('img')
    def validate_image_url(self, key, url):
        if not url:
            return url
        if not url.startswith('http://') and not url.startswith('https://'):
            raise ValueError("Invalid image URL format.")
        return url

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
        return f"<Comment(id={self.id}, user_id={self.user_id}, post_id={self.post_id}, text={self.text})>"

class Post(db.Model, SerializerMixin):
    __tablename__ = "posts"

    serialize_only = ('id', 'textbook_id', 'user_id', 'price', 'condition', 'created_at')

    id = db.Column(Integer, primary_key=True)
    textbook_id = db.Column(Integer, ForeignKey('textbooks.id'), nullable=False)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    price = db.Column(Integer)
    condition = db.Column(String)
    created_at = db.Column(DateTime, server_default=func.now())

    user = relationship('User', back_populates='posts')
    textbook = relationship('Textbook', back_populates='posts', cascade="all, delete")
    comments = relationship('Comment', back_populates='post', cascade="all, delete-orphan")
    watchlists = relationship('Watchlist', back_populates='post')

    def __repr__(self):
        return f"<Post(id={self.id}, textbook_id={self.textbook_id}, user_id={self.user_id}, price={self.price})>"

class Watchlist(db.Model, SerializerMixin):
    __tablename__ = "watchlists"

    serialize_rules = ('-post.watchlists', '-textbook.watchlists')

    id = db.Column(Integer, primary_key=True)
    post_id = db.Column(Integer, ForeignKey('posts.id'))
    textbook_id = db.Column(Integer, ForeignKey('textbooks.id'))

    post = relationship('Post', back_populates='watchlists')
    textbook = relationship('Textbook', back_populates='watchlists')

    def __repr__(self):
        return f"<Watchlist(id={self.id}, post_id={self.post_id}, textbook_id={self.textbook_id})>"


