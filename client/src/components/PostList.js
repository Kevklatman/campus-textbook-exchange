// src/components/PostList.js
import React, { useEffect, useState } from "react";

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts from the API when the component mounts
    const fetchPosts = async () => {
      try {
        const response = await fetch("/posts");
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

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
              <img src={post.textbook.image_url} alt={post.textbook.title} className="post-image" />
              <p>Author: {post.textbook.author}</p>
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