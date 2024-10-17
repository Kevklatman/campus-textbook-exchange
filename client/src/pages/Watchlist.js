import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const { user, watchlistPosts, removeFromWatchlist } = useContext(UserContext);

  if (!user) {
    return <div>Please log in to view your watchlist.</div>;
  }

  if (!Array.isArray(watchlistPosts) || watchlistPosts.length === 0) {
    return <div>Your watchlist is empty.</div>;
  }

  return (
    <div className="watchlist-container">
      <h2>Watchlist</h2>
      {watchlistPosts.map((item) => (
        <div key={item.id} className="watchlist-item">
          <h3>{item.textbook?.title}</h3>
          {item.image_url && (
            <div className="watchlist-image-container">
              <img src={item.image_url} alt={item.textbook?.title} className="watchlist-image" />
            </div>
          )}
          <div className="watchlist-details">
            <p>Author: {item.textbook?.author}</p>
            <p>ISBN: {item.textbook?.isbn}</p>
            <p>Price: ${item.price}</p>
            <p>Condition: {item.condition}</p>
          </div>
          <div className="watchlist-actions">
            <Link to={`/posts/${item.id}`} className="view-details-link">View Details</Link>
            <button onClick={() => removeFromWatchlist(item.id)} className="remove-button">Remove from Watchlist</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Watchlist;