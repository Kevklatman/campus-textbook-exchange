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
        const [postResponse, commentsResponse] = await Promise.all([
          fetch(`/posts/${postId}`),
          fetch(`/posts/${postId}/comments`)
        ]);
        const postData = await postResponse.json();
        const commentsData = await commentsResponse.json();
        setPost({ ...postData, comments: commentsData });
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
        const updatedCommentsResponse = await fetch(`/posts/${postId}/comments`);
        const updatedCommentsData = await updatedCommentsResponse.json();
        setPost((prevPost) => ({ ...prevPost, comments: updatedCommentsData }));
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