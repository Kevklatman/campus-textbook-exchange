#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Textbook, Comment, Post, Watchlist

def seed_users(fake, num_users=10):
    users = []
    for i in range(num_users):
        try:
            user = User(
                email=fake.email(domain='example.edu'),
                name=fake.name()
            )
            user.password_hash = 'password123'
            users.append(user)
            db.session.add(user)
            db.session.commit()
            print(f"Created user: {user.email}")
        except Exception as e:
            print(f"Error creating user {i}: {str(e)}")
            db.session.rollback()
    return users

def seed_textbooks(fake, num_textbooks=10):
    textbooks = []
    for i in range(num_textbooks):
        try:
            textbook = Textbook(
                author=fake.name(),
                title=fake.sentence(nb_words=4),
                subject=fake.word(),
                isbn=fake.unique.random_int(min=1000000000000, max=9999999999999)
            )
            textbooks.append(textbook)
            db.session.add(textbook)
            db.session.commit()
            print(f"Created textbook: {textbook.title}")
        except Exception as e:
            print(f"Error creating textbook {i}: {str(e)}")
            db.session.rollback()
    return textbooks

def seed_posts(fake, users, textbooks, num_posts=20):
    posts = []
    for i in range(num_posts):
        try:
            post = Post(
                textbook_id=rc(textbooks).id,
                user_id=rc(users).id,
                price=randint(10, 100),
                condition=rc(['New', 'Like New', 'Good', 'Fair']),
                created_at=fake.date_time_this_year(),
                img=fake.image_url()
            )
            posts.append(post)
            db.session.add(post)
            db.session.commit()
            print(f"Created post: {post.id}")
        except Exception as e:
            print(f"Error creating post {i}: {str(e)}")
            db.session.rollback()
    return posts

def seed_comments(fake, users, posts, num_comments=30):
    for i in range(num_comments):
        try:
            comment = Comment(
                user_id=rc(users).id,
                post_id=rc(posts).id,
                text=fake.paragraph(nb_sentences=3),
                created_at=fake.date_time_this_year()
            )
            db.session.add(comment)
            db.session.commit()
            print(f"Created comment: {comment.id}")
        except Exception as e:
            print(f"Error creating comment {i}: {str(e)}")
            db.session.rollback()

def seed_watchlists(users, posts, num_watchlists=15):
    for i in range(num_watchlists):
        try:
            user = rc(users)
            post = rc(posts)
            watchlist = Watchlist(
                user_id=user.id,
                post_id=post.id,
                textbook_id=post.textbook_id
            )
            db.session.add(watchlist)
            db.session.commit()
            print(f"Created watchlist item: {watchlist.id}")
        except Exception as e:
            print(f"Error creating watchlist item {i}: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Seed data
        users = seed_users(fake)
        if not users:
            print("Failed to create any users. Exiting.")
            exit(1)
        
        textbooks = seed_textbooks(fake)
        if not textbooks:
            print("Failed to create any textbooks. Exiting.")
            exit(1)
        
        posts = seed_posts(fake, users, textbooks)
        if not posts:
            print("Failed to create any posts. Exiting.")
            exit(1)
        
        seed_comments(fake, users, posts)
        seed_watchlists(users, posts)
        
        print("Seeding complete!")