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

  return (
    <div className="comments-section">
      <h4>Comments:</h4>
      {comments && comments.length > 0 ? (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.user.email}: {comment.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      {user ? (
        <div className="new-comment">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={handleCommentChange}
          ></textarea>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
        <p>Please log in to leave a comment.</p>
      )}
    </div>
  );
}

export default CommentSection;