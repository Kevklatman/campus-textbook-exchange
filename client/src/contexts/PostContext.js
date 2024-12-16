// PostContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from './UserContext';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const { fetchNotifications, user, makeRequest } = React.useContext(UserContext);

  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await makeRequest('/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching all posts:', error);
    }
  }, [makeRequest]);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const updatePost = async (postId, updatedPostData) => {
    try {
      const response = await makeRequest(`/posts/${postId}`, {
        method: 'PUT',
        body: updatedPostData
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? updatedPost : post
        )
      );

      // Fetch new notifications after post update
      if (user) {
        await fetchNotifications(user.id);
      }

      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await makeRequest(`/posts/${postId}`, { 
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        // Fetch new notifications after post deletion
        if (user) {
          await fetchNotifications(user.id);
        }
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
      fetchAllPosts,
      updatePost 
    }}>
      {children}
    </PostContext.Provider>
  );
};