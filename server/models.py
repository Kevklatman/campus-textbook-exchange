from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship
from config import db

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String)

    posts = relationship('Post', back_populates='user')
    comments = relationship('Comment', back_populates='user')

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

class Textbook(db.Model, SerializerMixin):
    __tablename__ = "textbooks"

    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String)
    title = db.Column(db.String)
    isbn = db.Column(db.Integer)
    img = db.Column(db.String)

    posts = relationship('Post', back_populates='textbook')

    def __repr__(self):
        return f"<Textbook(id={self.id}, title={self.title}, author={self.author})>"

class Comment(db.Model, SerializerMixin):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')

    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, post_id={self.post_id})>"

class Post(db.Model, SerializerMixin):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    textbook_id = db.Column(db.Integer, db.ForeignKey('textbooks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    price = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = relationship('User', back_populates='posts')
    textbook = relationship('Textbook', back_populates='posts')
    comments = relationship('Comment', back_populates='post')
    watchlists = relationship('Watchlist', back_populates='post')

    def __repr__(self):
        return f"<Post(id={self.id}, textbook_id={self.textbook_id}, user_id={self.user_id}, price={self.price})>"

class Watchlist(db.Model, SerializerMixin):
    __tablename__ = "watchlists"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'))
    textbook_id = db.Column(db.Integer, db.ForeignKey('textbooks.id'))

    post = relationship('Post', back_populates='watchlists')
    textbook = relationship('Textbook')

    def __repr__(self):
        return f"<Watchlist(id={self.id}, post_id={self.post_id}, textbook_id={self.textbook_id})>"
