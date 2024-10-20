import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

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
      className={isInWatchlist ? "btn-danger" : "btn-success"}
      onClick={handleWatchlistClick}
    >
      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export default WatchlistButton;