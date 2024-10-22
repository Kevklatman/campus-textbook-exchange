import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { PostContext } from "../contexts/PostContext";
import "../index.css";

function PostList({ posts, onEditPost, onDeletePost, showEditButton, onAddToWatchlist, onRemoveFromWatchlist }) {
  const { user, watchlistPosts } = useContext(UserContext);

  const handleWatchlistClick = (postId, textbookId) => {
    const isInWatchlist = watchlistPosts.some(watchlistPost => watchlistPost.id === postId);
    if (isInWatchlist) {
      onRemoveFromWatchlist(postId);
    } else {
      onAddToWatchlist(postId, textbookId);
    }
  };

  if (!posts || !Array.isArray(posts)) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="post-list">
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <div className="post-header">
                <p className="posted-by">Posted by: {post.user.email}</p>
              </div>
              <h3 className="post-title">{post.textbook.title}</h3>
              {post.image_url && (
                <div className="post-image-container">
                  <img
                    src={post.image_url}
                    alt={post.textbook.title}
                    className="post-image"
                  />
                </div>
              )}
              <div className="post-details">
                <p>Author: {post.textbook.author}</p>
                <p>ISBN: {post.textbook.isbn}</p>
                <p>Price: ${post.price}</p>
                <p>Condition: {post.condition}</p>
              </div>
              {post.id && (
                <Link to={`/posts/${post.id}`} className="btn btn-secondary">
                  View Details
                </Link>
              )}
              {showEditButton && user && post.user.id === user.id && (
                <>
                  <button className="btn btn-secondary" onClick={() => onEditPost(post)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => onDeletePost(post.id)}>Delete</button>
                </>
              )}
              {user && (
                <button 
                  className={watchlistPosts.some(watchlistPost => watchlistPost.id === post.id) ? "btn btn-danger" : "btn btn-success"}
                  onClick={() => handleWatchlistClick(post.id, post.textbook.id)}
                >
                  {watchlistPosts.some(watchlistPost => watchlistPost.id === post.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
}

export default PostList;