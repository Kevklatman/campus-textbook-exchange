// src/pages/PostDetails.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import CommentSection from '../components/CommentSection';

function PostDetails() {
  const { user } = useContext(UserContext);
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/posts/${postId}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (commentText) => {
    try {
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const updatedPost = { ...post };
        updatedPost.comments = [...(updatedPost.comments || []), { user: { email: user.email }, text: commentText }];
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post-details-container">
      <h2>{post.textbook.title}</h2>
      {post.textbook.image_url && (
        <div className="post-image-container">
          <img src={post.textbook.image_url} alt={post.textbook.title} className="post-image" />
        </div>
      )}
      <div className="post-details">
        <p>Author: {post.textbook.author}</p>
        <p>ISBN: {post.textbook.isbn}</p>
        <p>Price: {post.price}</p>
        <p>Condition: {post.condition}</p>
        <p>Posted by: {post.user.email}</p>
      </div>
      <CommentSection comments={post.comments} onCommentSubmit={handleCommentSubmit} />
    </div>
  );
}

export default PostDetails;