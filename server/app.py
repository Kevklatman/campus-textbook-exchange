from flask import Flask, jsonify, request, make_response, session
from flask_restful import Resource, Api
from models import Post, Textbook, User, Comment, Watchlist
from config import *
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_uploads import configure_uploads, UploadNotAllowed
import logging
configure_uploads(app, images)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

class PostResource(Resource):
    def get(self, post_id=None):
        if post_id is None:
            user_id = request.args.get('user_id')
            if user_id:
                posts = Post.query.filter_by(user_id=user_id).all()
            else:
                posts = Post.query.all()

            posts_data = []
            for post in posts:
                user = post.user
                textbook = post.textbook
                post_data = post.to_dict()
                post_data['id'] = post.id
                post_data['user'] = {
                    'id': user.id,
                    'email': user.email
                }
                post_data['textbook'] = {
                    'id': textbook.id,
                    'title': textbook.title,
                    'author': textbook.author,
                    'image_url': textbook.img,
                    'isbn': textbook.isbn
                }
                post_data['comments'] = [comment.to_dict() for comment in post.comments]
                posts_data.append(post_data)
            return posts_data, 200
        else:
            post = Post.query.get(post_id)
            if post is None:
                return {"message": "Post not found"}, 404
            user = post.user
            textbook = post.textbook
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
            post_data['comments'] = [comment.to_dict() for comment in post.comments]
            return post_data, 200

    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        user_id = data.get('user_id')
        textbook_id = data.get('textbook_id')
        price = data.get('price')
        condition = data.get('condition')
        isbn = data.get('isbn')

        if not user_id or not textbook_id:
            return {"message": "User ID and Textbook ID are required"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        textbook = Textbook.query.get(textbook_id)
        if not textbook:
            return {"message": "Textbook not found"}, 404

        # Update the textbook's ISBN if provided
        if isbn:
            try:
                Textbook.validate_isbn(isbn)
                textbook.isbn = isbn
            except ValueError as e:
                return {"message": str(e)}, 400

        new_post = Post(
            user_id=user_id,
            textbook_id=textbook_id,
            price=price,
            condition=condition
        )

        db.session.add(new_post)
        db.session.commit()

        return new_post.to_dict(), 201

    def delete(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        db.session.delete(post)
        db.session.commit()

        return make_response({"message": "Post and associated textbook successfully deleted"}, 204)

    def put(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        if post.user_id != current_user.id:
            return {"message": "Unauthorized"}, 401

        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        post.price = data.get('price', post.price)
        post.condition = data.get('condition', post.condition)

        textbook_data = data.get('textbook')
        if textbook_data:
            textbook = post.textbook
            textbook.title = textbook_data.get('title', textbook.title)
            textbook.author = textbook_data.get('author', textbook.author)
            textbook.isbn = textbook_data.get('isbn', textbook.isbn)

        db.session.commit()

        return make_response(post.to_dict(), 200)

class TextbookResource(Resource):
    def get(self, textbook_id=None):
        if textbook_id is None:
            textbooks = Textbook.query.all()
            textbooks_data = [textbook.to_dict() for textbook in textbooks]
            return textbooks_data, 200
        else:
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
                textbook.img = images.url(filename)
            except UploadNotAllowed:
                return {"message": "Invalid image file"}, 400

        db.session.add(textbook)
        db.session.commit()

        return textbook.to_dict(), 201

    def delete(self, textbook_id):
        textbook = Textbook.query.get(textbook_id)
        if textbook is None:
            return {"message": "Textbook not found"}, 404

        db.session.delete(textbook)
        db.session.commit()

        return {"message": "Textbook deleted successfully"}, 200

class UserResource(Resource):
    def get(self):
        users = User.query.all()
        users_data = [user.to_dict() for user in users]
        return users_data, 200

    def delete(self, user_id):
        user = User.query.get(user_id)

        if not user:
            return {'message': 'User not found.'}, 404

        # Delete associated textbooks
        for post in user.posts:
            if post.textbook:
                db.session.delete(post.textbook)

        db.session.delete(user)
        db.session.commit()

        return {'message': 'User deleted successfully.'}, 200


class CommentResource(Resource):
    def get(self, post_id=None):
        if post_id is None:
            comments = Comment.query.all()
            comments_data = [comment.to_dict() for comment in comments]
            return comments_data, 200
        else:
            comments = Comment.query.filter_by(post_id=post_id).all()
            comments_data = [comment.to_dict() for comment in comments]
            return comments_data, 200

    def post(self, post_id):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        text = data.get('text')

        if not text:
            return {"message": "Comment text is required"}, 400

        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        user = current_user

        new_comment = Comment(text=text, user_id=user.id, post_id=post_id)
        db.session.add(new_comment)
        db.session.commit()

        return new_comment.to_dict(), 201

class WatchlistResource(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        watchlist_items = Watchlist.query.filter_by(user_id=user_id).all()
        watchlist_data = []

        for item in watchlist_items:
            post = Post.query.get(item.post_id)
            if post:
                textbook = post.textbook
                user = post.user
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
                post_data['comments'] = [comment.to_dict() for comment in post.comments]
                watchlist_data.append(post_data)

        return watchlist_data, 200

    def post(self, user_id):
        try:
            data = request.get_json()
            if not data:
                return {"message": "No input data provided"}, 400

            post_id = data.get('post_id')
            textbook_id = data.get('textbook_id')

            if not post_id or not textbook_id:
                return {"message": "Both Post ID and Textbook ID are required"}, 400

            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            post = Post.query.get(post_id)
            if not post:
                return {"message": "Post not found"}, 404

            textbook = Textbook.query.get(textbook_id)
            if not textbook:
                return {"message": "Textbook not found"}, 404

            watchlist_item = Watchlist.query.filter_by(user_id=user_id, post_id=post_id, textbook_id=textbook_id).first()
            if watchlist_item:
                return {"message": "Item already in watchlist"}, 400

            new_watchlist_item = Watchlist(user_id=user_id, post_id=post_id, textbook_id=textbook_id)

            db.session.add(new_watchlist_item)
            db.session.commit()

            return new_watchlist_item.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error adding item to watchlist: {str(e)}")
            return {"message": "Internal Server Error", "error": str(e)}, 500
    def delete(self, user_id, post_id):
        try:
            watchlist_item = Watchlist.query.filter_by(user_id=user_id, post_id=post_id).first()
            if not watchlist_item:
                return {"message": "Watchlist item not found"}, 404

            db.session.delete(watchlist_item)
            db.session.commit()

            return {"message": "Watchlist item deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error deleting watchlist item: {str(e)}")
            return {"message": "Internal Server Error", "error": str(e)}, 500
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

api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(TextbookResource, '/textbooks', '/textbooks/<int:textbook_id>')
api.add_resource(CommentResource, '/comments', '/posts/<int:post_id>/comments')
api.add_resource(LoginResource, '/login')
api.add_resource(LogoutResource, '/logout')
api.add_resource(CheckSessionResource, '/check_session')
api.add_resource(SignupResource, '/signup')
api.add_resource(WatchlistResource, '/users/<int:user_id>/watchlist', '/users/<int:user_id>/watchlist/<int:post_id>')
api.add_resource(UserResource, '/users', '/users/<int:user_id>')

if __name__ == '__main__':
    app.run(debug=True)