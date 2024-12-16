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
from flask import session
from datetime import timedelta
from flask_wtf.csrf import generate_csrf, CSRFError
from functools import wraps
from math import radians, cos, sin, asin, sqrt



logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

configure_uploads(app, images)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def send_email(subject, recipients, body):
    msg = Message(subject, recipients=recipients)
    msg.body = body
    mail.send(msg)

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 3956  # Radius of earth in miles
    return c * r


@app.after_request
def after_request(response):
    # Enable CORS
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers': 'X-CSRF-Token'
    })
    
    # Ensure CSRF token is set in cookie
    if 'csrf_token' not in request.cookies:
        token = generate_csrf()
        response.set_cookie(
            'csrf_token',
            token,
            secure=False,  # Set to True in production with HTTPS
            httponly=False,
            samesite='Lax',
            path='/'
        )
    
    return response

@app.route('/csrf_token', methods=['GET'])
@csrf.exempt
def get_csrf_token():
    token = generate_csrf()
    response = jsonify({'csrf_token': token})
    response.set_cookie(
        'csrf_token',
        token,
        secure=False,  # Set to True in production with HTTPS
        httponly=False,
        samesite='Lax',
        path='/'
    )
    return response

@app.before_request
def csrf_protect():
    if request.method not in ['GET', 'HEAD', 'OPTIONS']:
        # Check if we have a token in the session
        if 'csrf_token' not in session:
            token = generate_csrf()
            session['csrf_token'] = token

@app.after_request
def after_request(response):
    # Ensure CSRF token cookie is set
    if 'csrf_token' not in request.cookies:
        token = session.get('csrf_token', generate_csrf())
        response.set_cookie(
            'csrf_token',
            token,
            secure=True,
            httponly=False,
            samesite='Lax',
            path='/'
        )
    
    # Set CORS headers
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Expose-Headers': 'X-CSRF-Token'
    })
    
    return response

@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return jsonify({
        'error': 'CSRF token validation failed',
        'message': str(e),
        'status': 'error'
    }), 400


@app.route('/')
def index():
    return '<h1>Project Server</h1>'



from flask import Flask, jsonify, request, make_response
from flask_restful import Resource
from models import Post, Textbook, User
from sqlalchemy import func, or_
from math import radians, cos, sin, asin, sqrt
from datetime import datetime

class PostResource(Resource):
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees)
        """
        try:
            # Convert decimal degrees to radians
            lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

            # Haversine formula
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            # Radius of earth in miles
            r = 3956
            return c * r
        except (TypeError, ValueError):
            return None

    def get(self, post_id=None):
        try:
            if post_id is None:
                # Get query parameters
                user_id = request.args.get('user_id')
                lat = request.args.get('lat')
                lng = request.args.get('lng')
                radius = request.args.get('radius', type=float, default=10)
                sort_by = request.args.get('sort', default='date')  # 'date', 'price', or 'distance'
                search_query = request.args.get('q')
                subject = request.args.get('subject')
                min_price = request.args.get('min_price', type=float)
                max_price = request.args.get('max_price', type=float)
                condition = request.args.get('condition')

                # Start with base query
                query = Post.query

                # Apply filters
                if user_id:
                    query = query.filter_by(user_id=user_id)
                
                if subject:
                    query = query.join(Textbook).filter(Textbook.subject == subject)
                
                if min_price is not None:
                    query = query.filter(Post.price >= min_price)
                
                if max_price is not None:
                    query = query.filter(Post.price <= max_price)
                
                if condition:
                    query = query.filter(Post.condition == condition)
                
                if search_query:
                    search = f"%{search_query}%"
                    query = query.join(Textbook).filter(
                        or_(
                            Textbook.title.ilike(search),
                            Textbook.author.ilike(search),
                            Textbook.isbn.ilike(search)
                        )
                    )

                # Execute query
                posts = query.all()
                posts_data = []

                # Process posts with location filtering if applicable
                for post in posts:
                    post_data = post.to_dict()
                    post_data['user'] = post.user.to_dict()
                    post_data['textbook'] = post.textbook.to_dict()
                    post_data['comments'] = [comment.to_dict() for comment in post.comments]

                    # Calculate distance if location parameters provided
                    if lat and lng and post.latitude and post.longitude:
                        distance = self.haversine_distance(
                            lat, lng,
                            post.latitude, post.longitude
                        )
                        if distance is not None:
                            post_data['distance'] = round(distance, 1)
                            # Only include if within radius
                            if distance <= radius:
                                posts_data.append(post_data)
                    else:
                        posts_data.append(post_data)

                # Sort results
                if sort_by == 'price':
                    posts_data.sort(key=lambda x: float(x['price']))
                elif sort_by == 'distance' and lat and lng:
                    posts_data.sort(key=lambda x: x.get('distance', float('inf')))
                else:  # Default to date
                    posts_data.sort(key=lambda x: x['created_at'], reverse=True)

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

        except Exception as e:
            print(f"Error in get: {str(e)}")
            return {"message": "Internal server error"}, 500

    def post(self):
        try:
            data = request.form
            files = request.files
            print("Received data:", data)
            print("Received files:", files)

            # Validate required fields
            required_fields = ['user_id', 'isbn', 'price', 'condition']
            for field in required_fields:
                if not data.get(field):
                    return {"message": f"{field} is required"}, 400

            # Validate and process location data
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            if latitude and longitude:
                try:
                    latitude = float(latitude)
                    longitude = float(longitude)
                    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                        return {"message": "Invalid coordinates"}, 400
                except ValueError:
                    return {"message": "Invalid coordinates format"}, 400

            # Process ISBN
            try:
                isbn = int(data['isbn'])
                Textbook.validate_isbn(isbn)
            except ValueError as e:
                return {"message": str(e)}, 400

            # Verify user exists
            user = User.query.get(data['user_id'])
            if not user:
                return {"message": "User not found"}, 404

            # Get or create textbook
            textbook = Textbook.query.filter_by(isbn=isbn).first()
            if not textbook:
                textbook_data = {
                    'isbn': isbn,
                    'title': data.get('title', ''),
                    'author': data.get('author', ''),
                    'subject': data.get('subject', '')
                }
                textbook = Textbook(**textbook_data)
                db.session.add(textbook)

            # Create post
            post = Post(
                user_id=data['user_id'],
                textbook=textbook,
                price=data['price'],
                condition=data['condition'],
                latitude=latitude,
                longitude=longitude
            )
            
            # Handle image
            image_public_id = data.get('image_public_id')
            if image_public_id:
                post.img = image_public_id
            
            db.session.add(post)
            db.session.commit()

            # Prepare response
            post_data = post.to_dict()
            post_data['textbook'] = textbook.to_dict()
            post_data['user'] = user.to_dict()
            post_data['image_url'] = post.image_url

            return post_data, 201

        except Exception as e:
            print("Error creating post:", str(e))
            db.session.rollback()
            return {"message": f"Error creating post: {str(e)}"}, 500

    def put(self, post_id):
        try:
            post = Post.query.get(post_id)
            if not post:
                return {"message": "Post not found"}, 404

            if post.user_id != current_user.id:
                return {"message": "Unauthorized"}, 401

            data = request.form
            if not data:
                return {"message": "No input data provided"}, 400

            # Store original price for comparison
            original_price = float(post.price)

            # Update location if provided
            if 'latitude' in data and 'longitude' in data:
                try:
                    latitude = float(data['latitude'])
                    longitude = float(data['longitude'])
                    if -90 <= latitude <= 90 and -180 <= longitude <= 180:
                        post.latitude = latitude
                        post.longitude = longitude
                    else:
                        return {"message": "Invalid coordinates"}, 400
                except ValueError:
                    return {"message": "Invalid coordinates format"}, 400

            # Update other post fields
            post.price = data.get('price', post.price)
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
                    return {"message": str(e)}, 400

            # Handle image update
            image_public_id = data.get('image_public_id')
            if image_public_id:
                post.img = image_public_id

            # Handle price drop notifications
            new_price = float(post.price)
            if new_price < original_price:
                self._handle_price_drop_notification(post, original_price, new_price)

            db.session.commit()

            # Prepare response
            post_data = post.to_dict()
            post_data['textbook'] = textbook.to_dict()
            post_data['image_url'] = post.image_url

            return post_data, 200
                
        except Exception as e:
            db.session.rollback()
            print("Error updating post:", str(e))
            return {"message": "Error updating post", "error": str(e)}, 500

    def delete(self, post_id):
        try:
            post = Post.query.get(post_id)
            if not post:
                return {"message": "Post not found"}, 404

            if post.user_id != current_user.id:
                return {"message": "Unauthorized"}, 401

            db.session.delete(post)
            db.session.commit()
            return {"message": "Post deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting post", "error": str(e)}, 500

    def _handle_price_drop_notification(self, post, original_price, new_price):
        """Helper method to handle price drop notifications"""
        watchlist_items = Watchlist.query.filter_by(post_id=post.id).all()
        for item in watchlist_items:
            # Check existing notifications count
            existing_notifications = Notification.query\
                .filter_by(user_id=item.user_id)\
                .order_by(Notification.created_at.desc())\
                .all()
            
            # Create new notification
            notification = Notification(
                user_id=item.user_id,
                post_id=post.id,
                message=f"Price dropped for {post.textbook.title} from ${original_price:.2f} to ${new_price:.2f}!"
            )
            db.session.add(notification)
            
            # Remove oldest notifications if exceeding limit
            if len(existing_notifications) >= 3:
                notifications_to_delete = existing_notifications[2:]
                for old_notification in notifications_to_delete:
                    db.session.delete(old_notification)
            
            # Send email notification
            user = User.query.get(item.user_id)
            if user:
                subject = f"Price Drop Alert: {post.textbook.title}"
                body = f"The price of {post.textbook.title} has dropped from ${original_price:.2f} to ${new_price:.2f}. Check it out now!"
                recipients = [user.email]
                try:
                    send_email(subject, recipients, body)
                except Exception as e:
                    print(f"Error sending email notification: {str(e)}")

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
        try:
            # Verify CSRF token
            token = request.headers.get('X-CSRF-Token')
            if not token:
                return {"message": "CSRF token is missing"}, 400
            
            data = request.get_json()
            if not data:
                return {"message": "No input data provided"}, 400

            text = data.get('text')
            if not text:
                return {"message": "Comment text is required"}, 400

            post = Post.query.get(post_id)
            if not post:
                return {"message": "Post not found"}, 404

            new_comment = Comment(
                text=text,
                user_id=current_user.id,
                post_id=post_id
            )
            db.session.add(new_comment)
            db.session.commit()

            return new_comment.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    def delete(self, post_id, comment_id):
        try:
            # Verify CSRF token
            token = request.headers.get('X-CSRF-Token')
            if not token:
                return {"message": "CSRF token is missing"}, 400
            
            comment = Comment.query.get(comment_id)
            if not comment:
                return {"message": "Comment not found"}, 404

            if comment.user_id != current_user.id:
                return {"message": "Unauthorized"}, 401

            db.session.delete(comment)
            db.session.commit()
            return {"message": "Comment deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

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
        logout_user()
        session.clear()
        response = Response({"message": "Logged out successfully"}, 200)
        response.delete_cookie('session')
        response.delete_cookie('remember_token')
        return response

class CheckSessionResource(Resource):
    def get(self):
        try:
            # First check if user is authenticated through flask_login
            if current_user.is_authenticated:
                return current_user.to_dict(), 200
            
            # Then check if we have a valid session
            if 'user_id' in session:
                user = User.query.get(session['user_id'])
                if user:
                    login_user(user, remember=True)
                    session.permanent = True  # Make the session permanent
                    return user.to_dict(), 200
            
            return {'error': '401 Unauthorized'}, 401
            
        except Exception as e:
            logger.error(f"Error in check_session: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class SignupResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data:
                logger.warning("No input data provided for signup")
                return {"message": "No input data provided"}, 400

            email = data.get('email')
            password = data.get('password')
            name = data.get('name')

            if not email or not password:
                logger.warning("Email or password missing in signup attempt")
                return {"message": "Email and password are required"}, 400

            try:
                User.validate_email_format(email)
            except ValueError as e:
                logger.warning(f"Invalid email format in signup attempt: {email}")
                return {"message": str(e)}, 400

            if User.query.filter_by(email=email).first():
                logger.warning(f"Signup attempt with existing email: {email}")
                return {"message": "Email already exists"}, 400

            new_user = User(email=email, name=name)
            new_user.password_hash = password

            db.session.add(new_user)
            db.session.commit()
            
            # Generate new token and set up the response
            token = generate_csrf()
            response = make_response(new_user.to_dict(), 201)
            response.set_cookie(
                'csrf_token',
                token,
                secure=True,
                httponly=False,
                samesite='Lax',
                path='/'
            )
            
            # Log in the user
            login_user(new_user, remember=True)
            session['user_id'] = new_user.id
            session['csrf_token'] = token

            logger.info(f"New user signed up and logged in: {email}")
            return response

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error during user signup: {str(e)}")
            return {"message": f"An error occurred while creating the user: {str(e)}"}, 500



class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        
        if not data:
            logger.warning("No input data provided for login")
            return {"message": "No input data provided"}, 400

        email = data.get('email')
        password = data.get('password')
        remember = data.get('remember', True)

        if not email or not password:
            logger.warning("Email or password missing in login attempt")
            return {"message": "Email and password are required"}, 400

        user = User.query.filter_by(email=email).first()

        if user and user.authenticate(password):
            login_user(user, remember=remember)
            session.permanent = True
            session['user_id'] = user.id
            
            # Generate new CSRF token
            token = generate_csrf()
            session['csrf_token'] = token
            
            response = make_response(user.to_dict(), 200)
            response.set_cookie(
                'csrf_token',
                token,
                secure=True,
                httponly=False,
                samesite='Lax',
                path='/',
                max_age=3600
            )
            return response
        else:
            logger.warning(f"Failed login attempt for user: {email}")
            return {"message": "Invalid email or password"}, 401


class NotificationResource(Resource):
    MAX_NOTIFICATIONS = 3  

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
    app.run(port=5555, debug=True)