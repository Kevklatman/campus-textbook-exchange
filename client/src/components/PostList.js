import React from "react";

function PostList({ posts }) {
  return (
    <div className="post-list">
      <h2>Posts</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <div className="post-header">
                <p className="posted-by">Posted by: {post.user.email}</p>
              </div>
              <h3>{post.title}</h3>
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="post-image" />
              )}
              <p>Author: {post.author}</p>
              <p>ISBN: {post.isbn}</p>
              <p>Price: {post.price}</p>
              <p>Condition: {post.condition}</p>
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