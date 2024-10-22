import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

function CommentSection({ comments, onCommentSubmit }) {
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(UserContext);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = () => {
    if (newComment.trim() !== '') {
      onCommentSubmit(newComment);
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId) => {
     {
      try {
        const response = await fetch(`/posts/${comments[0].post_id}/comments/${commentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Trigger a refresh of the comments by calling onCommentSubmit with null
          onCommentSubmit(null);
        } else {
          const data = await response.json();
          console.error('Error deleting comment:', data.message);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const date = new Date(dateString);
    return `Posted ${date.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      {comments && comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.user.email}</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
                {user && user.id === comment.user.id && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn btn-danger comment-delete-btn"
                  >
                    Delete
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
          ></textarea>
          <button className="btn btn-success" onClick={handleSubmit}>
            Post Comment
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