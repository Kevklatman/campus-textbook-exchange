#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import *

# Views go here!

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

# Add the resource to the API
api.add_resource(PostResource, '/posts', '/posts/<int:post_id>')

if __name__ == '__main__':
    app.run(debug=True)