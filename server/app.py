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

class PostListResource(Resource):
    def get(self):
        # Query all posts
        posts = Post.query.all()
        
        # Serialize the posts
        posts_data = [post.to_dict() for post in posts]
        
        return posts_data, 200

# Add the resource to the API
api.add_resource(PostListResource, '/posts')

if __name__ == '__main__':
    app.run(port=5555, debug=True)