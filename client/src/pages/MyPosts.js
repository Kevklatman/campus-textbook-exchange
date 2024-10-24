// MyPosts.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import PostList from '../components/PostList';
import EditPostForm from '../components/EditPostForm';
import { useHistory } from 'react-router-dom';

function MyPosts() {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);
  const { posts, updatePost, deletePost, fetchAllPosts } = useContext(PostContext);
  const [myPosts, setMyPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  // Fetch posts when component mounts
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        await fetchAllPosts();
      } catch (error) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPosts();
    }
  }, [user, fetchAllPosts]);

  // Filter posts when posts array or user changes
  useEffect(() => {
    if (user && posts) {
      setMyPosts(posts.filter((post) => post.user.id === user.id));
    }
  }, [user, posts]);

  const handleEditPost = (post) => {
    setEditingPost(post);
    setError(null);
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const formData = new FormData();
      formData.append('price', updatedPost.price);
      formData.append('condition', updatedPost.condition);
      formData.append('title', updatedPost.textbook.title);
      formData.append('author', updatedPost.textbook.author);
      formData.append('isbn', updatedPost.textbook.isbn);
      formData.append('subject', updatedPost.textbook.subject);
      
      if (updatedPost.image_public_id) {
        formData.append('image_public_id', updatedPost.image_public_id);
      }

      await updatePost(updatedPost.id, formData);
      setEditingPost(null);
      setError(null);
      await fetchAllPosts(); // Refresh the posts after update
    } catch (error) {
      setError(`Failed to update post: ${error.message}`);
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this post?');
      if (!confirmed) return;

      await deletePost(postId);
      setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      setError('Failed to delete post. Please try again later.');
      console.error('Error deleting post:', error);
    }
  };

  const handleAddToWatchlist = async (postId, textbookId) => {
    try {
      await addToWatchlist(postId, textbookId);
    } catch (error) {
      setError('Failed to add to watchlist. Please try again later.');
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = async (postId) => {
    try {
      await removeFromWatchlist(postId);
    } catch (error) {
      setError('Failed to remove from watchlist. Please try again later.');
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setError(null);
  };

  if (!user) {
    history.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">My Posts</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {editingPost ? (
        <EditPostForm
          post={editingPost}
          onUpdatePost={handleUpdatePost}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          {myPosts.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any posts yet.</p>
              <button 
                onClick={() => history.push('/create-post')} 
                className="btn btn-primary"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <PostList
              posts={myPosts}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              showEditButton={true}
              isUserPosts={true}
            />
          )}
        </>
      )}
    </div>
  );
}

export default MyPosts;