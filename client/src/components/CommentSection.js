import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

function CommentSection({ comments, onCommentSubmit }) {
  const [newComment, setNewComment] = useState('');
  const { user, csrfToken } = useContext(UserContext);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/posts/${comments[0].post_id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setNewComment('');
      await onCommentSubmit(newComment);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeleting(commentId);
    try {
      const response = await fetch(`/posts/${comments[0].post_id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      await onCommentSubmit(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return commentDate.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments {comments.length > 0 && `(${comments.length})`}</h3>

      {comments && comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.user.email}</span>
                <time 
                  className="comment-date" 
                  dateTime={comment.created_at}
                  title={new Date(comment.created_at).toLocaleString()}
                >
                  {formatDate(comment.created_at)}
                </time>
                {user && user.id === comment.user.id && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn btn-danger comment-delete-btn"
                    disabled={deleting === comment.id}
                  >
                    {deleting === comment.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
              <p className="comment-content">{comment.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-comments">
          No comments yet. Be the first to comment!
        </div>
      )}
      
      {user ? (
        <div className="new-comment">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={handleCommentChange}
            disabled={submitting}
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
          <button 
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <div className="login-prompt">
          Please log in to leave a comment.
        </div>
      )}
    </div>
  );
}

export default CommentSection;