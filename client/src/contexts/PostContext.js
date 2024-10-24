import React, { createContext, useState, useEffect, useCallback } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await fetch('/posts', {
        credentials: 'include'
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching all posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      setPosts, 
      addPost, 
      deletePost, 
      fetchAllPosts 
    }}>
      {children}
    </PostContext.Provider>
  );
};