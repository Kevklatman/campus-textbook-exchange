// src/contexts/PostContext.js
import React, { createContext, useState, useEffect } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [watchlistPosts, setWatchlistPosts] = useState([]);

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

    const updatePost = async (updatedPost) => {
      try {
        const response = await fetch(`/posts/${updatedPost.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPost),
        });
        if (response.ok) {
          setPosts((prevPosts) =>
            prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
          );
    
          // Check if the updated post is in any user's watchlist and if the price has dropped
          const originalPost = posts.find((post) => post.id === updatedPost.id);
          if (originalPost && updatedPost.price < originalPost.price) {
            // Trigger email notifications (handled by the backend)
            await fetch(`/posts/${updatedPost.id}/price-drop-notifications`, {
              method: 'POST',
            });
          }
        } else {
          throw new Error('Error updating post');
        }
      } catch (error) {
        console.error('Error updating post:', error);
      }
    };

  const deletePost = async (postId) => {
    try {
      await fetch(`/posts/${postId}`, { method: 'DELETE' });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <PostContext.Provider value={{ posts, updatePost, deletePost, watchlistPosts, setWatchlistPosts }}>
      {children}
    </PostContext.Provider>
  );
};