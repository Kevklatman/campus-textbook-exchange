from flask import Flask, jsonify, request, make_response, session, Response
from flask_restful import Resource, Api
from models import Post, Textbook, User, Comment, Watchlist, Notification
from config import *
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_uploads import configure_uploads, UploadNotAllowed
from flask_mail import Message
import logging
from cloudinary.uploader import upload
from cloudinary.utils import cloudinary_url

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    app_logger.debug('Headers: %s', request.headers)
    app_logger.debug('Body: %s', request.get_data())

@app.after_request
def log_response_info(response):
    app_logger.debug('Response Status: %s', response.status)
    app_logger.debug('Response Headers: %s', response.headers)
    return response

configure_uploads(app, images)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def send_email(subject, recipients, body):
    try:
        msg = Message(subject, recipients=recipients)
        msg.body = body
        mail.send(msg)
        app_logger.info(f"Email sent successfully to {recipients}")
        return True
    except Exception as e:
        app_logger.error(f"Failed to send email to {recipients}: {str(e)}")
        return False

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
                post_data = post.to_dict()
                post_data['user'] = post.user.to_dict()
                post_data['textbook'] = post.textbook.to_dict()
                post_data['comments'] = [comment.to_dict() for comment in post.comments]
                posts_data.append(post_data)
            
            return posts_data, 200
        else:
            post = Post.query.get(post_id)
            if post is None:
                return {"message": "Post not found"}, 404
            
            post_data = post.to_dict()
            post_data['user'] = post.user.to_dict()
            post_data['textbook'] = post.textbook.to_dict()
            post_data['comments'] = [comment.to_dict() for comment in post.comments]
            
            return post_data, 200
        

    def post(self):
        try:
            data = request.form
            files = request.files
            print("Received data:", data)
            print("Received files:", files)

            user_id = data.get('user_id')
            isbn = data.get('isbn')
            price = data.get('price')
            condition = data.get('condition')

            if not user_id or not isbn or not price or not condition:
                return {"message": "User ID, ISBN, price, and condition are required"}, 400

            try:
                isbn = int(isbn)
                Textbook.validate_isbn(isbn)
            except ValueError as e:
                return {"message": str(e)}, 400

            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            textbook = Textbook.query.filter_by(isbn=isbn).first()
            if not textbook:
                textbook_data = {
                    'isbn': isbn,
                    'title': data.get('title', ''),
                    'author': data.get('author', ''),
                    'subject': data.get('subject', '')  # Add subject field here
                }
                textbook = Textbook(**textbook_data)
                db.session.add(textbook)

            post = Post(user_id=user_id, textbook=textbook, price=price, condition=condition)
            
            image_public_id = data.get('image_public_id')
            if image_public_id:
                post.img = image_public_id
            
            db.session.add(post)
            db.session.commit()

            post_data = post.to_dict()
            post_data['textbook'] = textbook.to_dict()
            post_data['user'] = user.to_dict()
            post_data['image_url'] = post.image_url

            print("Returning post data:", post_data)
            return post_data, 201
        except Exception as e:
            print("Error creating post:", str(e))
            db.session.rollback()
            return {"message": f"Error creating post: {str(e)}"}, 500

    def put(self, post_id):
        print(f"Received PUT request for post {post_id}")
        try:
            if not current_user.is_authenticated:
                print("User not authenticated")
                return {"message": "Authentication required"}, 401

            post = Post.query.get(post_id)
            if not post:
                print(f"Post {post_id} not found")
                return {"message": "Post not found"}, 404

            if post.user_id != current_user.id:
                print(f"Unauthorized attempt to edit post {post_id}")
                return {"message": "Unauthorized"}, 401

            data = request.form
            if not data:
                print("No input data provided")
                return {"message": "No input data provided"}, 400

            print(f"Processing update for post {post_id} with data: {data}")
            
            # Store original price for comparison
            original_price = float(post.price)
            new_price = float(data.get('price', post.price))
            
            app_logger.debug(f"Price comparison - Original: ${original_price:.2f}, New: ${new_price:.2f}")

            # Update post fields
            post.price = new_price
            post.condition = data.get('condition', post.condition)

            # Update textbook fields
            textbook = post.textbook
            textbook.title = data.get('title', textbook.title)
            textbook.author = data.get('author', textbook.author)
            textbook.subject = data.get('subject', textbook.subject)
            
            if 'isbn' in data:
                try:
                    isbn = int(data['isbn'])
                    Textbook.validate_isbn(isbn)
                    textbook.isbn = isbn
                except ValueError as e:
                    print(f"Invalid ISBN: {str(e)}")
                    return {"message": str(e)}, 400

            # Handle image update
            image_public_id = data.get('image_public_id')
            if image_public_id:
                post.img = image_public_id

            # Process notifications and emails for price changes
            if new_price < original_price:
                app_logger.info(f"Price reduction detected for post {post_id}")
                watchlist_items = Watchlist.query.filter_by(post_id=post_id).all()
                app_logger.debug(f"Found {len(watchlist_items)} watchlist items")

                for item in watchlist_items:
                    # Create notification
                    notification = Notification(
                        user_id=item.user_id,
                        post_id=post_id,
                        message=f"Price dropped for {post.textbook.title} from ${original_price:.2f} to ${new_price:.2f}!"
                    )
                    db.session.add(notification)
                    app_logger.debug(f"Created notification for user {item.user_id}")

                    # Send email to watchlist user
                    user = User.query.get(item.user_id)
                    if user and user.email:
                        app_logger.debug(f"Attempting to send email to {user.email}")
                        with app.app_context():
                            email_success = send_email(
                                subject="Price Drop Alert - Campus Textbook Exchange",
                                recipients=[user.email],
                                body=f"""
Hello {user.name or user.email},

Good news! A textbook on your watchlist has dropped in price:

Textbook: {post.textbook.title}
Author: {post.textbook.author}
Original Price: ${original_price:.2f}
New Price: ${new_price:.2f}

You can view the post here: http://localhost:3000/posts/{post_id}

Best regards,
Campus Textbook Exchange Team
                                """
                            )
                            if email_success:
                                app_logger.info(f"Price drop email sent to {user.email}")
                            else:
                                app_logger.error(f"Failed to send price drop email to {user.email}")

            # Commit all changes
            db.session.commit()
            app_logger.info(f"Successfully updated post {post_id}")

            # Return the full post data with associations
            post_data = post.to_dict()
            post_data['textbook'] = post.textbook.to_dict()
            post_data['user'] = current_user.to_dict()
            post_data['image_url'] = post.image_url

            return post_data, 200
                
        except Exception as e:
            db.session.rollback()
            app_logger.error(f"Error updating post {post_id}: {str(e)}", exc_info=True)
            return {"message": f"Error updating post: {str(e)}"}, 500
    
    def delete(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        if post.user_id != current_user.id:
            return {"message": "Unauthorized"}, 401

        try:
            db.session.delete(post)
            db.session.commit()
            return {"message": "Post deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting post", "error": str(e)}, 500

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

        existing_textbook = Textbook.query.filter_by(isbn=isbn).first()
        if existing_textbook:
            return existing_textbook.to_dict(), 200

        textbook = Textbook(author=author, title=title, isbn=isbn)
        

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
    
    def delete(self, post_id, comment_id):
        comment = Comment.query.get(comment_id)
        if not comment:
            return {"message": "Comment not found"}, 404

        # Check if the current user is the comment owner
        if comment.user_id != current_user.id:
            return {"message": "Unauthorized"}, 401

        try:
            db.session.delete(comment)
            db.session.commit()
            return {"message": "Comment deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting comment", "error": str(e)}, 500

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
                post_data = post.to_dict()
                post_data['textbook'] = {
                    'id': textbook.id,
                    'title': textbook.title,
                    'author': textbook.author,
                    'isbn': textbook.isbn
                }
                post_data['image_url'] = post.image_url  # Make sure this is included
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

            # Send email to post owner
            if post.user.email:
                send_email(
                    subject="New Watchlist Addition - Campus Textbook Exchange",
                    recipients=[post.user.email],
                    body=f"""
Hello {post.user.name or post.user.email},

Someone has added your textbook post to their watchlist!

Textbook: {post.textbook.title}
Listed Price: ${post.price:.2f}

This means there's active interest in your listing. Make sure your post is up to date!

Best regards,
Campus Textbook Exchange Team
                    """
                )

            # Rest of the watchlist creation logic...
            textbook = Textbook.query.get(textbook_id)
            if not textbook:
                return {"message": "Textbook not found"}, 404

            watchlist_item = Watchlist.query.filter_by(
                user_id=user_id, 
                post_id=post_id, 
                textbook_id=textbook_id
            ).first()
            
            if watchlist_item:
                return {"message": "Item already in watchlist"}, 400

            new_watchlist_item = Watchlist(
                user_id=user_id, 
                post_id=post_id, 
                textbook_id=textbook_id
            )

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


class CheckSessionResource(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(), 200
        return {'error': '401 Unauthorized'}, 401

class LoginResource(Resource):
    def post(self):
        try:
            # Log the raw request data for debugging
            app_logger.debug(f"Raw request data: {request.get_data()}")
            app_logger.debug(f"Request content type: {request.content_type}")
            app_logger.debug(f"Request headers: {request.headers}")
            
            data = request.get_json()
            app_logger.debug(f"Parsed JSON data: {data}")
            
            if not data:
                app_logger.warning("No input data provided for login")
                return {"message": "No input data provided"}, 400

            email = data.get('email')
            password = data.get('password')
            remember = data.get('remember', False)

            app_logger.debug(f"Login attempt - Email: {email}, Remember: {remember}")

            if not email or not password:
                app_logger.warning(f"Missing credentials - Email present: {bool(email)}, Password present: {bool(password)}")
                return {"message": "Email and password are required"}, 400

            user = User.query.filter_by(email=email).first()
            
            if not user:
                app_logger.warning(f"No user found with email: {email}")
                return {"message": "Invalid email or password"}, 401

            app_logger.debug(f"User found: {user.email}")
            
            if user.authenticate(password):
                app_logger.info(f"Login successful for user: {user.email}")
                login_user(user, remember=remember)
                if remember:
                    session.permanent = True
                    app_logger.debug("Set permanent session")
                
                # Log the response data
                response_data = user.to_dict()
                app_logger.debug(f"Sending response data: {response_data}")
                return response_data, 200
            else:
                app_logger.warning(f"Password verification failed for user: {user.email}")
                return {"message": "Invalid email or password"}, 401
                
        except Exception as e:
            app_logger.error(f"Login error: {str(e)}", exc_info=True)
            return {"message": "An error occurred during login"}, 500

class LogoutResource(Resource):
    def post(self):
        try:
            logout_user()
            session.clear()
            
            # Create a response dictionary
            response_data = {"message": "Logged out successfully"}
            
            # Create the response with Flask-RESTful
            response = jsonify(response_data)
            
            # Set cookie deletion headers
            response.set_cookie('session', '', expires=0)
            response.set_cookie('remember_token', '', expires=0)
            response.set_cookie('session', '', domain=None, expires=0)
            response.set_cookie('remember_token', '', domain=None, expires=0)
            
            app_logger.info(f"User successfully logged out")
            return response
            
        except Exception as e:
            app_logger.error(f"Logout error: {str(e)}", exc_info=True)
            return {"message": "Error during logout"}, 500

class SignupResource(Resource):
    def post(self):
        data = request.get_json()
        if not data:
            app_logger.warning("No input data provided for signup")
            return {"message": "No input data provided"}, 400

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password:
            app_logger.warning("Email or password missing in signup attempt")
            return {"message": "Email and password are required"}, 400

        try:
            User.validate_email_format(email)
        except ValueError as e:
            app_logger.warning(f"Invalid email format in signup attempt: {email}")
            return {"message": str(e)}, 400

        if User.query.filter_by(email=email).first():
            app_logger.warning(f"Signup attempt with existing email: {email}")
            return {"message": "Email already exists"}, 400

        try:
            new_user = User(email=email, name=name)
            new_user.password_hash = password
            
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            
            app_logger.info(f"New user signed up and logged in: {email}")
            return new_user.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            app_logger.error(f"Error during user signup: {str(e)}", exc_info=True)
            return {"message": f"An error occurred while creating the user: {str(e)}"}, 500
    
class NotificationResource(Resource):
    MAX_NOTIFICATIONS = 3  # Class constant for max notifications

    def get(self, user_id=None):
        try:
            notifications = Notification.query\
                .filter_by(user_id=current_user.id)\
                .order_by(Notification.created_at.desc())\
                .limit(self.MAX_NOTIFICATIONS)\
                .all()
            return [notification.to_dict() for notification in notifications], 200
        except Exception as e:
            print(f"Error fetching notifications: {str(e)}")
            return {"message": "Error fetching notifications"}, 500

    def patch(self, user_id=None, notification_id=None):
        try:
            if user_id and not notification_id:
                if user_id != current_user.id:
                    return {"message": "Unauthorized"}, 401
                
                notifications = Notification.query\
                    .filter_by(user_id=current_user.id, read=False)\
                    .order_by(Notification.created_at.desc())\
                    .limit(self.MAX_NOTIFICATIONS)\
                    .all()
                
                for notification in notifications:
                    notification.read = True
                
                db.session.commit()
                return {"message": "All notifications marked as read"}, 200
            
            elif notification_id:
                notification = Notification.query.get(notification_id)
                if not notification:
                    return {"message": "Notification not found"}, 404

                if notification.user_id != current_user.id:
                    return {"message": "Unauthorized"}, 401

                notification.read = True
                db.session.commit()
                return notification.to_dict(), 200
                
        except Exception as e:
            db.session.rollback()
            print(f"Error updating notification(s): {str(e)}")
            return {"message": "Error updating notification(s)"}, 500

        

from flask import current_app
from flask_mail import Message

def send_email(subject, recipients, body):
    """
    Send email with proper application context handling.
    """
    if not current_app:
        app_logger.error("No application context - email cannot be sent")
        return False
        
    try:
        msg = Message(
            subject,
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=recipients if isinstance(recipients, list) else [recipients]
        )
        msg.body = body
        
        app_logger.info(f"Attempting to send email to {recipients}")
        mail.send(msg)
        app_logger.info(f"Email sent successfully to {recipients}")
        return True
        
    except Exception as e:
        app_logger.error(f"Failed to send email: {str(e)}")
        return False

# Test route with application context
@app.route('/test_email')
def test_email():
    with app.app_context():
        try:
            success = send_email(
                'Test Email',
                'your-test-email@example.com',
                'This is a test email from the Campus Textbook Exchange system.'
            )
            if success:
                return 'Email sent successfully', 200
            return 'Failed to send email', 500
        except Exception as e:
            app_logger.error(f"Test email error: {str(e)}")
            return f'Error: {str(e)}', 500

# For testing in Python shell
def test_email_shell():
    with app.app_context():
        return send_email(
            'Test Email',
            'your-test-email@example.com',
            'This is a test email from the Campus Textbook Exchange system.'
        )

api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(TextbookResource, '/textbooks', '/textbooks/<int:textbook_id>')
api.add_resource(CommentResource, '/comments', 
                '/posts/<int:post_id>/comments',
                '/posts/<int:post_id>/comments/<int:comment_id>')
api.add_resource(LoginResource, '/login')
api.add_resource(LogoutResource, '/logout')
api.add_resource(CheckSessionResource, '/check_session')
api.add_resource(SignupResource, '/signup')
api.add_resource(WatchlistResource, '/users/<int:user_id>/watchlist', '/users/<int:user_id>/watchlist/<int:post_id>')
api.add_resource(NotificationResource, 
    '/users/<int:user_id>/notifications',  
    '/notifications/<int:notification_id>'  
)
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
if __name__ == '__main__':
    app.run(debug=True)

