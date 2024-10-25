import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import CommentSection from '../components/CommentSection';
import WatchlistButton from '../components/WatchlistButton';

function PostDetails() {
  const { user, makeRequest } = useContext(UserContext);
  const { posts } = useContext(PostContext);
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to find post in existing posts
        const foundPost = posts.find((p) => p.id === parseInt(postId));
        
        if (foundPost) {
          // If found in posts, just fetch comments
          const commentsResponse = await makeRequest(`/posts/${postId}/comments`);
          if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
          }
          const commentsData = await commentsResponse.json();
          setPost({ ...foundPost, comments: commentsData });
        } else {
          // If not found, fetch the full post
          const response = await makeRequest(`/posts/${postId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch post');
          }
          const postData = await response.json();
          const commentsResponse = await makeRequest(`/posts/${postId}/comments`);
          if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
          }
          const commentsData = await commentsResponse.json();
          setPost({ ...postData, comments: commentsData });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message || 'Error loading post details');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, posts, makeRequest]);

  const handleCommentSubmit = async () => {
    try {
      const commentsResponse = await makeRequest(`/posts/${postId}/comments`);
      if (!commentsResponse.ok) {
        throw new Error('Failed to refresh comments');
      }
      const updatedCommentsData = await commentsResponse.json();
      setPost((prevPost) => ({ ...prevPost, comments: updatedCommentsData }));
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!post) {
    return <div className="not-found">Post not found</div>;
  }

  return (
    <div className="post-details-container">
      <div className="post-details-header">
        <h2 className="post-details-title">{post.textbook.title}</h2>
        <span className="post-details-author">Posted by: {post.user.email}</span>
      </div>

      <div className="post-details-content">
        {post.image_url && (
          <div className="post-details-image-container">
            <img 
              src={post.image_url} 
              alt={post.textbook.title} 
              className="post-details-image" 
            />
          </div>
        )}

        <div className="post-details-info">
          <div className="post-details-meta">
            <div className="post-details-row">
              <span className="post-details-label">Author</span>
              <span className="post-details-value">{post.textbook.author}</span>
            </div>
            
            <div className="post-details-row">
              <span className="post-details-label">Subject</span>
              <span className="post-details-value">{post.textbook.subject}</span>
            </div>
            
            <div className="post-details-row">
              <span className="post-details-label">ISBN</span>
              <span className="post-details-value">{post.textbook.isbn}</span>
            </div>
            
            <div className="post-details-row">
              <span className="post-details-label">Price</span>
              <span className="post-details-value price">${post.price}</span>
            </div>
            
            <div className="post-details-row">
              <span className="post-details-label">Condition</span>
              <span className="post-details-condition">{post.condition}</span>
            </div>
          </div>

          <div className="post-details-actions">
            {user && (
              <WatchlistButton 
                postId={post.id} 
                textbookId={post.textbook.id}
                className="post-details-button watchlist"
              />
            )}
          </div>
        </div>
      </div>

      <div className="post-details-comments">
        <CommentSection 
          comments={post.comments} 
          onCommentSubmit={handleCommentSubmit}
          postId={parseInt(postId)}
        />
      </div>
    </div>
  );
}

export default PostDetails;