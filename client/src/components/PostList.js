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
              <h3>{post.textbook.title}</h3>
              {post.textbook.image_url && (
                <img
                  src={post.textbook.image_url}
                  alt={post.textbook.title}
                  className="post-image"
                />
              )}
              <p>Author: {post.textbook.author}</p>
              <p>ISBN: {post.textbook.isbn}</p>
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