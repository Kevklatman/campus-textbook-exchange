// src/contexts/PostContext.js
import React, { createContext, useState, useEffect } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await fetch('/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching all posts:', error);
      }
    };

    fetchAllPosts();
  }, []);

  const updatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  return (
    <PostContext.Provider value={{ posts, updatePost }}>
      {children}
    </PostContext.Provider>
  );
};