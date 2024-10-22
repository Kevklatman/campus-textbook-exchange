import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import PostList from '../components/PostList';
import EditPostForm from '../components/EditPostForm';

function MyPosts() {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);
  const { posts, updatePost, deletePost, fetchAllPosts } = useContext(PostContext);
  const [myPosts, setMyPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

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
      await updatePost(updatedPost);
      setEditingPost(null);
      // Refresh the posts after updating
      fetchAllPosts();
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

  const handleAddToWatchlist = async (postId, textbookId) => {
    try {
      await addToWatchlist(postId, textbookId);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = async (postId) => {
    try {
      await removeFromWatchlist(postId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view your posts.</div>;
  }

  return (
    <div>
      
    <div>
      <h2 className='my-posts'>My Posts</h2>
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
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          showEditButton={true}
        />
      )}
    </div>
    </div>
  );
}

export default MyPosts;