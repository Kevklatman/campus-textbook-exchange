from flask import Flask, jsonify
from flask_restful import Resource, Api
from models import db, Post, Textbook
from config import app, api

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

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

# Add the resource to the API
api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')
api.add_resource(TextBookResource, '/textbooks', '/textbooks/<int:textbook_id>')

if __name__ == '__main__':
    app.run(debug=True)
