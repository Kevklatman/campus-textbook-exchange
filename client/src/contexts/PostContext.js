import React, { createContext, useState, useEffect, useCallback } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await fetch('/posts');
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
    <PostContext.Provider value={{ posts, setPosts, addPost, updatePost, deletePost, fetchAllPosts }}>
      {children}
    </PostContext.Provider>
  );
};