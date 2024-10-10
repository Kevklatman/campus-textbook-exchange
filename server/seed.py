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
    for _ in range(num_users):
        user = User(
            email=fake.unique.email(domain='example.edu'),
            name=fake.name()
        )
        users.append(user)
        db.session.add(user)
    db.session.commit()
    return users

def seed_textbooks(fake, num_textbooks=10):
    textbooks = []
    for _ in range(num_textbooks):
        textbook = Textbook(
            author=fake.name(),
            title=fake.sentence(nb_words=4),
            isbn=fake.unique.random_int(min=1000000000000, max=9999999999999),
            img=fake.image_url()
        )
        textbooks.append(textbook)
        db.session.add(textbook)
    db.session.commit()
    return textbooks

def seed_posts(fake, users, textbooks, num_posts=20):
    posts = []
    for _ in range(num_posts):
        post = Post(
            textbook_id=rc(textbooks).id,
            user_id=rc(users).id,
            price=randint(10, 100),
            created_at=fake.date_time_this_year()
        )
        posts.append(post)
        db.session.add(post)
    db.session.commit()
    return posts

def seed_comments(fake, users, posts, num_comments=30):
    for _ in range(num_comments):
        comment = Comment(
            user_id=rc(users).id,
            post_id=rc(posts).id,
            created_at=fake.date_time_this_year()
        )
        db.session.add(comment)
    db.session.commit()

def seed_watchlists(users, posts, num_watchlists=15):
    for _ in range(num_watchlists):
        watchlist = Watchlist(
            post_id=rc(posts).id,
            textbook_id=rc(posts).textbook_id
        )
        db.session.add(watchlist)
    db.session.commit()

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")

        # Clear existing data
        db.drop_all()
        db.create_all()

        # Seed data
        users = seed_users(fake)
        textbooks = seed_textbooks(fake)
        posts = seed_posts(fake, users, textbooks)
        seed_comments(fake, users, posts)
        seed_watchlists(users, posts)

        print("Seeding complete!")
