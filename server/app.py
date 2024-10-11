from flask import Flask, jsonify, request, make_response, session
from flask_restful import Resource, Api
from models import Post, Textbook, User, Comment, Watchlist
from config import *
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash


login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

from flask import request, jsonify
from flask_restful import Resource
from models import db, Post, Textbook, User

class PostResource(Resource):
    def get(self, post_id=None):
        if post_id is None:
            # Get all posts
            posts = Post.query.all()
            posts_data = [post.to_dict() for post in posts]
            return posts_data, 200
        else:
            # Get a single post by ID
            post = Post.query.get(post_id)
            if post is None:
                return {"message": "Post not found"}, 404
            post_data = post.to_dict()
            return post_data, 200

    def post(self):
        # Parse and validate incoming data
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        # Extract fields
        user_id = data.get('user_id')
        author = data.get('author')
        title = data.get('title')
        isbn = data.get('isbn')
        price = data.get('price')
        condition = data.get('condition')

        if not user_id or not author or not title or not isbn:
            return {"message": "User ID, Author, Title, and ISBN are required"}, 400

        # Validate ISBN
        if not isinstance(isbn, int) or not (1000000000000 <= isbn < 10000000000000):
            return {"message": "ISBN must be a 13-digit integer"}, 400

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        # Check if textbook exists, if not create it
        textbook = Textbook.query.filter_by(author=author, title=title).first()
        if not textbook:
            textbook = Textbook(author=author, title=title, isbn=isbn)
            db.session.add(textbook)
            db.session.commit()

        # Create a new Post object
        new_post = Post(
            user_id=user_id,
            textbook_id=textbook.id,
            price=price,
            condition=condition
        )

        # Add and commit the new post to the database
        db.session.add(new_post)
        db.session.commit()

        return new_post.to_dict(), 201
    

    def delete(self, post_id):
        # Retrieve the post by ID
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        # Delete the post
        db.session.delete(post)
        db.session.commit()

        return make_response({"message": "Post successfully deleted"}, 204)
    

    def patch(self, post_id):
        # Retrieve the post by ID
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        # Parse and validate incoming data
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        # Update only the fields provided in the request
        if 'price' in data:
            post.price = data['price']
        if 'condition' in data:
            post.condition = data['condition']

        # Commit changes to the database
        db.session.commit()

        return make_response(post.to_dict(), 200)




class TextBookResource(Resource):
    def get(self, textbook_id=None):
        if textbook_id is None:
            # Get all textbooks
            textbooks = Textbook.query.all()
            textbooks_data = [textbook.to_dict() for textbook in textbooks]
            return textbooks_data, 200
        else:
            # Get a single textbook by ID
            textbook = Textbook.query.get(textbook_id)
            if textbook is None:
                return {"message": "Textbook not found"}, 404
            textbook_data = textbook.to_dict()
            return textbook_data, 200
        
class UserResource(Resource):
    def get(self):
        users = User.query.all()
        users_data = [user.to_dict() for user in users]
        return users_data, 200
    
class CommentResource(Resource):
    def get(self):
        comments = Comment.query.all()
        comments_data = [comment.to_dict () for comment in comments]
        return comments_data, 200
    
class WatchlistResource(Resource):
    def get(self):
        watchlists = Watchlist.query.all()
        watchlist_data = [watchlist.to_dict() for watchlist in watchlists]
        return watchlist_data, 200
    



class LogoutResource(Resource):
    def post(self):
        session.pop('user_id', None)
        return {"message": "Logged out successfully"}, 200

class CheckSessionResource(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(), 200
        return {'error': '401 Unauthorized'}, 401
    
class SignupResource(Resource):
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return {"message": "Email and password are required"}, 400

        try:
            User.validate_email(email)
        except ValueError as e:
            return {"message": str(e)}, 400

        if User.query.filter_by(email=email).first():
            return {"message": "Email already exists"}, 400

        new_user = User(email=email)
        new_user.password_hash = password

        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id

        return new_user.to_dict(), 201

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.authenticate(password):
            login_user(user)
            session['user_id'] = user.id
            return user.to_dict(), 200
        else:
            return {'error': '401 Unauthorized'}, 401


# Add the resource to the API
api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(TextBookResource, '/textbooks', '/textbooks/<int:textbook_id>')
api.add_resource(UserResource, '/users')
api.add_resource(CommentResource, '/comments')
api.add_resource(WatchlistResource, '/watchlists')
api.add_resource(LoginResource, '/login')
api.add_resource(LogoutResource, '/logout')
api.add_resource(CheckSessionResource, '/check-session')
api.add_resource(SignupResource, '/signup')
if __name__ == '__main__':
    app.run(debug=True)
