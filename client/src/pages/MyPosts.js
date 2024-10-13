// src/pages/MyPosts.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import PostList from '../components/PostList';
import EditPostForm from '../components/EditPostForm';

function MyPosts() {
  const { user } = useContext(UserContext);
  const { posts, updatePost } = useContext(PostContext);
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

  const handleUpdatePost = async (updatedPost) => {
    try {
      const response = await fetch(`/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });

      if (response.ok) {
        updatePost(updatedPost);
        setEditingPost(null);
      } else {
        console.error('Error updating post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
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
        <PostList posts={myPosts} onEditPost={handleEditPost} showEditButton={true} />
      )}
    </div>
  );
}

export default MyPosts;