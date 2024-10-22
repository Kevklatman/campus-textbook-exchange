import React, { useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const { user, watchlistPosts, removeFromWatchlist, fetchWatchlist } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      fetchWatchlist(user.id);
    }
  }, [user, fetchWatchlist]);

  if (!user) {
    return (
      <div className="login-prompt-container">
        <p>Please log in to view your watchlist.</p>
      </div>
    );
  }

  if (!Array.isArray(watchlistPosts) || watchlistPosts.length === 0) {
    return (
      <div className="watchlist-container">
        <h2 className="post-details-title text-center">Watchlist</h2>
        <div className="login-prompt-container">
          <p>Your watchlist is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <h2 className="post-details-title text-center">Watchlist</h2>
      
      {watchlistPosts.map((item) => (
        <div key={item.id} className="post-item">
          <div className="post-container">
            <div className="post-header">
              <span className="post-author">Added to Watchlist</span>
            </div>

            <div className="post-main-content">
              <div className="post-left-column">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.textbook?.title} 
                    className="post-image"
                  />
                )}
              </div>

              <div className="post-right-column">
                <div className="book-details-section">
                  <h3 className="book-title">{item.textbook?.title}</h3>
                  
                  <div className="book-details">
                    <div className="book-meta">
                      <p className="detail-item">
                        <span className="label">Author:</span>
                        <span>{item.textbook?.author}</span>
                      </p>
                      <p className="detail-item">
                        <span className="label">ISBN:</span>
                        <span>{item.textbook?.isbn}</span>
                      </p>
                      <p className="detail-item">
                        <span className="label">Price:</span>
                        <span className="amount">${item.price}</span>
                      </p>
                      <div className="condition">
                        <span className="condition-label">Condition:</span>
                        <span className="condition-value">{item.condition}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="post-actions">
                  <div className="action-group">
                    <Link 
                      to={`/posts/${item.id}`} 
                      className="action-button view-details"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => removeFromWatchlist(item.id)} 
                      className="action-button remove-watchlist"
                    >
                      Remove from Watchlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Watchlist;