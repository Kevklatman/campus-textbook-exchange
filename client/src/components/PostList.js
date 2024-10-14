// src/components/PostList.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "../index.css";

function PostList({ posts, onEditPost, onDeletePost, showEditButton }) {
  const { user } = useContext(UserContext);

  const handleEditClick = (post) => {
    onEditPost(post);
  };

  const handleDeleteClick = (postId) => {
    onDeletePost(postId);
  };

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
              {showEditButton && user && post.user.id === user.id && (
                <>
                  <button onClick={() => handleEditClick(post)}>Edit</button>
                  <button onClick={() => handleDeleteClick(post.id)}>Delete</button>
                </>
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