import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import '../index.css';

function WatchlistButton({ postId, textbookId }) {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);

  const isInWatchlist = watchlistPosts.some((post) => post.id === postId);

  const handleWatchlistClick = async () => {
    if (isInWatchlist) {
      await removeFromWatchlist(postId);
    } else {
      await addToWatchlist(postId, textbookId);
    }
  };

  if (!user) return null;

  return (
    <button
      className="watchlist-button"
      onClick={handleWatchlistClick}
    >
      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export default WatchlistButton;