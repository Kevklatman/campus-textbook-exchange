// src/components/PostList.js
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

function PostList({ posts }) {
  console.log('Posts:', posts);

  return (
    <div className="post-list">
      <h2>Posts</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <div className="post-header">
                <p className="posted-by">Posted by: {post.user.email}</p>
              </div>
              <h3 className="post-title">{post.textbook.title}</h3>
              {post.textbook.image_url && (
                <div className="post-image-container">
                  <img
                    src={post.textbook.image_url}
                    alt={post.textbook.title}
                    className="post-image"
                  />
                </div>
              )}
              <div className="post-details">
                <p>Author: {post.textbook.author}</p>
                <p>ISBN: {post.textbook.isbn}</p>
                <p>Price: {post.price}</p>
                <p>Condition: {post.condition}</p>
              </div>
              {post.id && (
                <Link to={`/posts/${post.id}`} className="view-details-link">
                  View Details
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
}

export default PostList;