import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { PostContext } from "../contexts/PostContext";
import { MapPin, Edit2, Trash2, Eye } from 'lucide-react';

function PostList({ 
  posts, 
  onEditPost, 
  onDeletePost, 
  showEditButton, 
  showDistance,
  onAddToWatchlist, 
  onRemoveFromWatchlist 
}) {
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
              <div className="post-container">
                <div className="post-header">
                  <span className="post-author">Posted by: {post.user.email}</span>
                  {showDistance && post.distance !== undefined && (
                    <span className="post-distance flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {post.distance.toFixed(1)} miles away
                    </span>
                  )}
                </div>

                <div className="post-main-content">
                  <div className="post-left-column">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.textbook.title}
                        className="post-image"
                      />
                    )}
                  </div>

                  <div className="post-right-column">
                    <div className="book-details-section">
                      <h3 className="book-title">{post.textbook.title}</h3>
                      
                      <div className="book-details">
                        <div className="book-meta">
                          <p className="detail-item">
                            <span className="label">Author:</span> {post.textbook.author}
                          </p>
                          <p className="detail-item">
                            <span className="label">ISBN:</span> {post.textbook.isbn}
                          </p>
                          <p className="detail-item">
                            <span className="label">Subject:</span> {post.textbook.subject}
                          </p>
                          <p className="detail-item price">
                            <span className="label">Price:</span> 
                            <span className="amount">${post.price}</span>
                          </p>
                          <div className="condition">
                            <span className="condition-label">Condition:</span>
                            <span className="condition-value">{post.condition}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="post-actions">
                      <div className="action-group">
                        <Link 
                          to={`/posts/${post.id}`} 
                          className="action-button view-details"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        
                        {user && (
                          <>
                            <button 
                              className={`action-button ${
                                watchlistPosts.some(watchlistPost => watchlistPost.id === post.id)
                                  ? 'remove-watchlist'
                                  : 'add-watchlist'
                              }`}
                              onClick={() => handleWatchlistClick(post.id, post.textbook.id)}
                            >
                              {watchlistPosts.some(watchlistPost => watchlistPost.id === post.id)
                                ? 'Remove from Watchlist'
                                : 'Add to Watchlist'}
                            </button>

                            {showEditButton && user.id === post.user.id && (
                              <>
                                <button
                                  className="action-button edit-post"
                                  onClick={() => onEditPost(post)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit Post
                                </button>
                                <button
                                  className="action-button delete-post"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                      onDeletePost(post.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Post
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-posts-message">
          <p>No posts available matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default PostList;