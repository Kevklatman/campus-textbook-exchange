from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship
from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, DateTime, func, BigInteger
from config import db
import re

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    serialize_only = ('id', 'email', 'name')

    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(255), unique=True, nullable=False)
    name = db.Column(String)

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

class Textbook(db.Model, SerializerMixin):
    __tablename__ = "textbooks"

    serialize_only = ('id', 'author', 'title', 'isbn', 'img')

    id = db.Column(Integer, primary_key=True)
    author = db.Column(String)
    title = db.Column(String)
    subject = db.Column(String)
    isbn = db.Column(BigInteger, nullable=False)
    img = db.Column(String)

    posts = relationship('Post', back_populates='textbook')
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

class Comment(db.Model, SerializerMixin):
    __tablename__ = "comments"

    serialize_rules = ('-user.comments', '-post.comments')

    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = db.Column(Integer, ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(DateTime, server_default=func.now())

    user = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')

    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, post_id={self.post_id})>"

class Post(db.Model, SerializerMixin):
    __tablename__ = "posts"

    serialize_only = ('textbook_id', 'user_id', 'price', 'condition', 'created_at')

    id = db.Column(Integer, primary_key=True)
    textbook_id = db.Column(Integer, ForeignKey('textbooks.id'), nullable=False)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    price = db.Column(Integer)
    condition = db.Column(String)
    created_at = db.Column(DateTime, server_default=func.now())

    user = relationship('User', back_populates='posts')
    textbook = relationship('Textbook', back_populates='posts')
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
