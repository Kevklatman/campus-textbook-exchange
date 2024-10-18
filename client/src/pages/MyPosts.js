// src/pages/MyPosts.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import PostList from '../components/PostList';
import EditPostForm from '../components/EditPostForm';

function MyPosts() {
  const { user } = useContext(UserContext);
  const { posts, updatePost, deletePost } = useContext(PostContext);
  const [myPosts, setMyPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (user) {
      setMyPosts(posts.filter((post) => post.user.id === user.id));
    }
  }, [user, posts]);

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = async (formData) => {
    try {
      const postId = editingPost.id;
      console.log("Sending update for post ID:", postId);
  
      const response = await fetch(`/posts/${postId}`, {
        method: 'PUT',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const updatedPost = await response.json();
      console.log("Received updated post:", updatedPost);
      updatePost(updatedPost);
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view your posts.</div>;
  }

  return (
    <div>
      <h2>My Posts</h2>
      {editingPost ? (
        <EditPostForm
          post={editingPost}
          onUpdatePost={handleUpdatePost}
          onCancel={() => setEditingPost(null)}
        />
      ) : (
        <PostList
          posts={myPosts}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          showEditButton={true}
        />
      )}
    </div>
  );
}

export default MyPosts;