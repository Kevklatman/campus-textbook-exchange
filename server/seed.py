#!/usr/bin/env python3

import requests
from random import randint, choice as rc
from faker import Faker
from app import app
from models import db, User, Textbook, Comment, Post, Watchlist, Notification
from cloudinary.uploader import upload
import cloudinary
from config import CLOUDINARY_UPLOAD_PRESET, cloudinary
import time
from sqlalchemy.exc import IntegrityError
from io import BytesIO

fake = Faker()

print("🔧 Checking Cloudinary Configuration...")
try:
    cloudinary_config = cloudinary.config()
    print(f"✅ Cloudinary configured with cloud_name: {cloudinary_config.cloud_name}")
except Exception as e:
    print(f"❌ Cloudinary configuration error: {str(e)}")
    exit(1)

TEXTBOOK_COVERS = {
    "Mathematics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/3/2/1/0321982384.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134468902.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134686489.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134652290.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134753658.jpg"
    ],
    "Computer Science": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134743355.jpg",  # Python
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134641280.jpg",  # Programming
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134522184.jpg"   # Data Structures
    ],
    "Physics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134876989.jpg",  # Physics
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134876986.jpg",  # University Physics (fixed)
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134080378.jpg"   # Modern Physics
    ],
    "Chemistry": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134414233.jpg",  # Chemistry
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134804589.jpg",  # Organic Chemistry
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134641620.jpg"   # Biochemistry (fixed)
    ],
    "Biology": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134093410.jpg",  # Campbell Biology
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134641744.jpg",  # Biology
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134635205.jpg"   # Cell Biology
    ],
    "Economics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134729331.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134833112.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134890280.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134735692.jpg"
    ],

    "Psychology": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134240839.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134101588.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134447972.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134551906.jpg"
    ]
}

TEXTBOOK_COVER_FALLBACKS = {
    "Mathematics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/3/2/1/0321982384.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134468902.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134686489.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134652290.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134753658.jpg"
    ],
    "Computer Science": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134682327.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134700066.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134741145.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134601548.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134444329.jpg"
    ],
    "Physics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134876989.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134602188.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134743881.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134876986.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134876970.jpg"
    ],
    "Chemistry": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134414232.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134554639.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134561589.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134804589.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134989899.jpg"
    ],
    "Biology": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134240685.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134554639.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134641744.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134737547.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134446399.jpg"
    ],
    "Economics": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134729331.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134833112.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134890280.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134735692.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134796551.jpg"
    ],
    "Psychology": [
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134240839.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134101588.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134447972.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134551906.jpg",
        "https://www.pearsonhighered.com/assets/bigcovers/0/1/3/4/0134641132.jpg"
    ]
}

SUBJECTS = list(TEXTBOOK_COVERS.keys())

FAKE_UNIVERSITIES = [
    'fakecollege.edu',
    'notarealschool.edu',
    'mockiversity.edu',
    'testuniversity.edu',
    'exampleschool.edu'
]

# Book titles by subject
BOOK_TITLES = {
    "Mathematics": [
        "Linear Algebra and Its Applications",
        "Stats: Data and Models",
        "Thomas' Calculus"
    ],
    "Computer Science": [
        "Starting Out with Python",
        "Java: An Introduction to Problem Solving and Programming",
        "Computer Science: An Overview"
    ],
    "Physics": [
        "College Physics",
        "University Physics",
        "Physics for Scientists and Engineers"
    ],
    "Chemistry": [
        "Chemistry: The Central Science",
        "Organic Chemistry",
        "Fundamentals of General, Organic, and Biological Chemistry"
    ],
    "Biology": [
        "Campbell Biology",
        "Biology: A Global Approach",
        "Becker's World of the Cell"
    ],
    "Economics": [
        "Economics: Principles, Applications, and Tools",
        "Macroeconomics: Policy and Practice",
        "Microeconomics: Theory and Applications"
    ],
    "Psychology": [
        "Psychology and Life",
        "Social Psychology",
        "Psychology: From Inquiry to Understanding"
    ]
}

def get_subject_image(subject):
    """Get a random book cover for a specific subject"""
    if subject in TEXTBOOK_COVERS:
        return rc(TEXTBOOK_COVERS[subject])
    return rc(TEXTBOOK_COVERS[rc(list(TEXTBOOK_COVERS.keys()))])

def get_subject_title(subject):
    """Get a random book title for a specific subject"""
    if subject in BOOK_TITLES:
        return rc(BOOK_TITLES[subject])
    return rc(BOOK_TITLES[rc(list(BOOK_TITLES.keys()))])

def seed_users(num_users=10):
    """Create fake users with obviously fictional .edu email addresses"""
    print("🌱 Seeding users...")
    users = []
    
    for i in range(num_users):
        try:
            name = fake.name()
            email = f"{name.lower().replace(' ', '.')}{randint(1,999)}@{rc(FAKE_UNIVERSITIES)}"
            user = User(
                email=email,
                name=name
            )
            user.password_hash = 'password123'
            users.append(user)
            db.session.add(user)
            db.session.commit()
            print(f"✅ Created user: {user.email}")
        except IntegrityError:
            db.session.rollback()
            print(f"❌ Error: Duplicate email for user {i}, retrying...")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating user {i}: {str(e)}")
    return users

def seed_textbooks(num_textbooks=20):
    """Create fake textbooks with realistic subjects and ISBNs"""
    print("🌱 Seeding textbooks...")
    textbooks = []
    used_isbns = set()
    
    for i in range(num_textbooks):
        try:
            while True:
                isbn = fake.unique.random_int(min=1000000000000, max=9999999999999)
                if isbn not in used_isbns:
                    used_isbns.add(isbn)
                    break
            
            subject = rc(SUBJECTS)
            title = get_subject_title(subject)
            textbook = Textbook(
                author=fake.name(),
                title=title,
                subject=subject,
                isbn=isbn
            )
            textbooks.append(textbook)
            db.session.add(textbook)
            db.session.commit()
            print(f"✅ Created textbook: {textbook.title}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating textbook {i}: {str(e)}")
    return textbooks

def download_image(url):
    """Download image from URL and return as bytes"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Check if we got actual image data
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            print(f"⚠️ URL did not return an image (content-type: {content_type})")
            return None
            
        # Check if the image is larger than 1KB
        if len(response.content) < 1024:
            print("⚠️ Image too small - might be a placeholder")
            return None
            
        return BytesIO(response.content)
    except Exception as e:
        print(f"⚠️ Failed to download image: {str(e)}")
        return None

def seed_posts(users, textbooks, num_posts=30):
    """Create posts with real textbook covers"""
    print("🌱 Seeding posts...")
    posts = []
    retry_count = 3
    
    for i in range(num_posts):
        try:
            textbook = rc(textbooks)
            current_url = get_subject_image(textbook.subject)
            image_public_id = None
            
            print(f"\n📚 Processing image for {textbook.title}")
            
            # Try main URL first, then fallbacks if it fails
            urls_to_try = [current_url] + TEXTBOOK_COVER_FALLBACKS.get(textbook.subject, [])
            
            for url in urls_to_try:
                print(f"🔗 Trying URL: {url}")
                image_data = download_image(url)
                
                if image_data:
                    try:
                        upload_result = upload(
                            image_data,
                            folder="textbook_covers",
                            upload_preset=CLOUDINARY_UPLOAD_PRESET,
                            resource_type="auto"
                        )
                        
                        image_public_id = upload_result['public_id']
                        print(f"✅ Upload successful! Public ID: {image_public_id}")
                        break  # Exit the URL loop if successful
                        
                    except Exception as e:
                        print(f"⚠️ Upload failed: {str(e)}")
                        continue  # Try next URL if upload fails
                else:
                    print(f"⚠️ Failed to download image from {url}")
                    continue  # Try next URL if download fails
            
            if not image_public_id:
                print("❌ All image URLs failed")

            # Create post even if image upload failed
            post = Post(
                textbook_id=textbook.id,
                user_id=rc(users).id,
                price=randint(20, 200),
                condition=rc(['New', 'Like New', 'Very Good', 'Good', 'Acceptable']),
                created_at=fake.date_time_this_year(),
                img=image_public_id
            )
            posts.append(post)
            db.session.add(post)
            db.session.commit()
            print(f"✅ Created post for: {textbook.title}")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating post {i}: {str(e)}")
            
    return posts

def seed_comments(users, posts, num_comments=50):
    """Create realistic comments for posts"""
    print("🌱 Seeding comments...")
    comment_templates = [
        "Is this still available?",
        "What's the condition of the book like?",
        "Would you accept {}?",
        "I'm interested in this book. Is the price negotiable?",
        "Does it have any highlighting or notes?",
        "Are there any missing pages?",
        "Can you meet on campus?",
        "Do you have any other books for {}?",
        "Is this the latest edition?",
        "Does it come with the access code?"
    ]
    
    for i in range(num_comments):
        try:
            template = rc(comment_templates)
            if "{}" in template:
                if "price" in template.lower():
                    text = template.format(f"${randint(20, 150)}")
                else:
                    text = template.format(rc(SUBJECTS))
            else:
                text = template
                
            comment = Comment(
                user_id=rc(users).id,
                post_id=rc(posts).id,
                text=text,
                created_at=fake.date_time_this_year()
            )
            db.session.add(comment)
            db.session.commit()
            print(f"✅ Created comment: {text[:30]}...")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating comment {i}: {str(e)}")

def seed_watchlists(users, posts, num_watchlists=40):
    """Create watchlist entries"""
    print("🌱 Seeding watchlists...")
    for i in range(num_watchlists):
        try:
            user = rc(users)
            post = rc(posts)
            # Check if watchlist item already exists
            existing = Watchlist.query.filter_by(
                user_id=user.id,
                post_id=post.id,
                textbook_id=post.textbook_id
            ).first()
            
            if not existing:
                watchlist = Watchlist(
                    user_id=user.id,
                    post_id=post.id,
                    textbook_id=post.textbook_id
                )
                db.session.add(watchlist)
                db.session.commit()
                print(f"✅ Created watchlist item for user {user.email}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating watchlist item {i}: {str(e)}")

def seed_notifications(users, posts, num_notifications=30):
    """Create sample notifications"""
    print("🌱 Seeding notifications...")
    
    notification_templates = [
        "Price dropped for {} from ${} to ${}!",
        "The price of {} has been reduced from ${} to ${}!",
        "Good news! {} is now ${} cheaper! New price: ${}",
    ]

    for i in range(num_notifications):
        try:
            user = rc(users)
            post = rc(posts)
            original_price = randint(50, 200)
            new_price = original_price - randint(10, 40)
            
            template = rc(notification_templates)
            message = template.format(
                post.textbook.title,
                original_price,
                new_price
            )

            notification = Notification(
                user_id=user.id,
                post_id=post.id,
                message=message,
                created_at=fake.date_time_this_year(),
                read=rc([True, False, False])  # Make some read, some unread
            )
            
            db.session.add(notification)
            db.session.commit()
            print(f"✅ Created notification for user {user.email}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating notification {i}: {str(e)}")

if __name__ == '__main__':
    with app.app_context():
        print("🌱 Starting seed process...")
        
        # Import the Notification model at the top of your seed.py file
        from models import db, User, Textbook, Comment, Post, Watchlist, Notification
        
        users = seed_users()
        if not users:
            print("❌ Failed to create users. Exiting.")
            exit(1)
        
        textbooks = seed_textbooks()
        if not textbooks:
            print("❌ Failed to create textbooks. Exiting.")
            exit(1)
        
        posts = seed_posts(users, textbooks)
        if not posts:
            print("❌ Failed to create posts. Exiting.")
            exit(1)
        
        seed_comments(users, posts)
        seed_watchlists(users, posts)
        seed_notifications(users, posts)  # Add this line
        
        print("\n✨ Seeding complete! Database is ready.")