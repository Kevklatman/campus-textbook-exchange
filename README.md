# 📚 Campus Textbook Exchange

## Overview
Campus Textbook Exchange is a full-stack web application that provides university students with a platform to buy and sell textbooks within their campus community. The platform features real-time notifications, email alerts for price drops, and a watchlist system to help students find the best deals on their required textbooks.

## 🌟 Features

### User Authentication & Security
- Secure email-based authentication (.edu addresses only)
- Password encryption using bcrypt
- Session management with remember-me functionality
- Protected routes for authenticated users

### Textbook Listings
- Create, read, update, and delete textbook listings
- Upload textbook cover images (Cloudinary integration)
- Search functionality by title, author, or ISBN
- Filter textbooks by subject
- Detailed textbook information including condition and pricing

### Watchlist System
- Add/remove textbooks to personal watchlist
- Real-time notifications for price changes
- Email alerts when watched textbooks drop in price
- Automatic notifications when your listing gets added to someone's watchlist

### Interactive Features
- Comment system on textbook listings
- Real-time notification bell for system updates
- User dashboard for managing posts and watchlist
- Responsive design for mobile and desktop use

## 🛠 Technology Stack

### Frontend
- React.js
- Context API for state management
- React Router for navigation
- Tailwind CSS for styling
- Cloudinary for image management

### Backend
- Flask (Python)
- SQLAlchemy ORM
- Flask-Mail for email notifications
- Flask-Login for authentication
- Flask-RESTful for API endpoints

### Database
- SQLite (Development)
- PostgreSQL (Production)

## 📋 Prerequisites
- Python 3.8+
- Node.js 14+
- Gmail account for email notifications
- Cloudinary account for image hosting

## 🚀 Getting Started

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/campus-textbook-exchange.git
cd campus-textbook-exchange

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Initialize database
flask db upgrade
python seed.py  # Optional: Add sample data

# Run the server
flask run
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

## 💌 Email Configuration
To enable email notifications:
1. Create a Gmail account or use an existing one
2. Enable 2-factor authentication
3. Generate an App Password
4. Add credentials to .env file:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
```

## 🔐 Environment Variables
```plaintext
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-app-password
```

## 🗃 Database Schema
```plaintext
Users
- id (Primary Key)
- email (Unique, .edu only)
- name
- password_hash

Textbooks
- id (Primary Key)
- isbn (13 digits)
- title
- author
- subject

Posts
- id (Primary Key)
- user_id (Foreign Key)
- textbook_id (Foreign Key)
- price
- condition
- image_url

Watchlist
- id (Primary Key)
- user_id (Foreign Key)
- post_id (Foreign Key)

Notifications
- id (Primary Key)
- user_id (Foreign Key)
- post_id (Foreign Key)
- message
- read
- created_at
```

## 📱 API Endpoints
```plaintext
Authentication
POST /signup - Create new user account
POST /login - Authenticate user
POST /logout - End user session

Posts
GET /posts - List all posts
POST /posts - Create new post
GET /posts/<id> - Get specific post
PUT /posts/<id> - Update post
DELETE /posts/<id> - Delete post

Watchlist
GET /users/<id>/watchlist - Get user's watchlist
POST /users/<id>/watchlist - Add to watchlist
DELETE /users/<id>/watchlist/<post_id> - Remove from watchlist

Notifications
GET /users/<id>/notifications - Get user's notifications
PATCH /notifications/<id> - Mark notification as read
```

## 🛡 Security Features
- CSRF protection
- Password hashing
- Session management
- Input validation
- XSS prevention
- Rate limiting
- Secure email configuration

## 🤝 Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request



## 👏 Acknowledgments
- Mom

## 📧 Contact
For questions or support, please email: campustextbookexchange@gmail.com

## 🐛 Known Issues
- Image upload size limited to 10MB
- Email notifications may be delayed during high traffic
- Search functionality limited to exact matches

## 🔜 Future Improvements
- Add price history graphs
- Implement in-app messaging
- Add textbook condition photos
- Enable bulk upload for multiple textbooks
- Add mobile app version