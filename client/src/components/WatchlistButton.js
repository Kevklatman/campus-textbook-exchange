import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import '../index.css';

function WatchlistButton({ postId, textbookId }) {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);

  const isInWatchlist = (postId) => {
    return Array.isArray(watchlistPosts) && watchlistPosts.some((post) => post.id === postId);
  };

  const handleWatchlistClick = () => {
    if (isInWatchlist(postId)) {
      removeFromWatchlist(postId);
    } else {
      addToWatchlist(postId, textbookId);
    }
  };

  if (!user) return null;

  return (
    <button
      className="watchlist-button"
      onClick={handleWatchlistClick}
    >
      {isInWatchlist(postId) ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export default WatchlistButton;