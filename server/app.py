from flask import Flask, jsonify, request, make_response, session
from flask_restful import Resource, Api
from models import Post, Textbook, User, Comment, Watchlist
from config import *
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_uploads import configure_uploads, UploadNotAllowed

configure_uploads(app, images)

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
            user_id = request.args.get('user_id')
            if user_id:
                # Get posts created by the specified user
                posts = Post.query.filter_by(user_id=user_id).all()
            else:
                # Get all posts
                posts = Post.query.all()

            posts_data = []
            for post in posts:
                user = User.query.get(post.user_id)
                textbook = Textbook.query.get(post.textbook_id)
                post_data = post.to_dict()
                post_data['id'] = post.id  # Add the 'id' field to the post_data dictionary

                post_data['user'] = {
                    'id': user.id,
                    'email': user.email
                }
                post_data['textbook'] = {
                    'id': textbook.id,
                    'title': textbook.title,
                    'author': textbook.author,
                    'image_url': textbook.img
                }
                posts_data.append(post_data)
            return posts_data, 200
        else:
            # Get a single post by ID
            post = Post.query.get(post_id)
            if post is None:
                return {"message": "Post not found"}, 404
            user = User.query.get(post.user_id)
            textbook = Textbook.query.get(post.textbook_id)
            post_data = post.to_dict()
            post_data['user'] = {
                'id': user.id,
                'email': user.email
            }
            post_data['textbook'] = {
                'id': textbook.id,
                'title': textbook.title,
                'author': textbook.author,
                'image_url': textbook.img
            }
            return post_data, 200

    def post(self):
        # Parse and validate incoming data
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        # Extract fields
        user_id = data.get('user_id')
        textbook_id = data.get('textbook_id')
        price = data.get('price')
        condition = data.get('condition')

        if not user_id or not textbook_id:
            return {"message": "User ID and Textbook ID are required"}, 400

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        # Check if textbook exists
        textbook = Textbook.query.get(textbook_id)
        if not textbook:
            return {"message": "Textbook not found"}, 404

        # Create a new Post object
        new_post = Post(
            user_id=user_id,
            textbook_id=textbook_id,
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




class TextbookResource(Resource):
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

    def post(self):
        data = request.form
        if not data:
            return {"message": "No input data provided"}, 400

        author = data.get('author')
        title = data.get('title')
        isbn = data.get('isbn')

        if not author or not title or not isbn:
            return {"message": "Author, Title, and ISBN are required"}, 400

        # Validate ISBN
        try:
            isbn = int(isbn)
            Textbook.validate_isbn(isbn)
        except ValueError as e:
            return {"message": str(e)}, 400

        textbook = Textbook(author=author, title=title, isbn=isbn)

        if 'image' in request.files:
            image_file = request.files['image']
            try:
                filename = images.save(image_file)
                textbook.img = images.url(filename)  # Store the full image URL
            except UploadNotAllowed:
                return {"message": "Invalid image file"}, 400

        db.session.add(textbook)
        db.session.commit()

        return textbook.to_dict(), 201
        
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

        login_user(new_user)

        return new_user.to_dict(), 201

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.authenticate(password):
            login_user(user)
            return user.to_dict(), 200
        else:
            return {'error': 'Invalid email or password'}, 401


# Add the resource to the API
api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(TextbookResource, '/textbooks', '/textbooks/<int:textbook_id>')
api.add_resource(UserResource, '/users')
api.add_resource(CommentResource, '/comments')
api.add_resource(WatchlistResource, '/watchlists')
api.add_resource(LoginResource, '/login')
api.add_resource(LogoutResource, '/logout')
api.add_resource(CheckSessionResource, '/check_session')
api.add_resource(SignupResource, '/signup')

if __name__ == '__main__':
    app.run(debug=True)
