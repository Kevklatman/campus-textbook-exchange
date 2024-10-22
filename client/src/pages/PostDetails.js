import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import CommentSection from '../components/CommentSection';
import WatchlistButton from '../components/WatchlistButton';

function PostDetails() {
  const { user } = useContext(UserContext);
  const { posts } = useContext(PostContext);
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const foundPost = posts.find((p) => p.id === parseInt(postId));
        if (foundPost) {
          const commentsResponse = await fetch(`/posts/${postId}/comments`);
          const commentsData = await commentsResponse.json();
          setPost({ ...foundPost, comments: commentsData });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId, posts]);

  const handleCommentSubmit = async (commentText) => {
    try {
      if (commentText === null) {
        const commentsResponse = await fetch(`/posts/${postId}/comments`);
        const updatedCommentsData = await commentsResponse.json();
        setPost((prevPost) => ({ ...prevPost, comments: updatedCommentsData }));
        return;
      }

      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const updatedCommentsResponse = await fetch(`/posts/${postId}/comments`);
        const updatedCommentsData = await updatedCommentsResponse.json();
        setPost((prevPost) => ({ ...prevPost, comments: updatedCommentsData }));
      }
    } catch (error) {
      console.error('Error with comment:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post-details-container">
      <div className="post-details-header">
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
          <h2 className="post-details-title">{post.textbook.title}</h2>
          
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
        />
      </div>
    </div>
  );
}

export default PostDetails;