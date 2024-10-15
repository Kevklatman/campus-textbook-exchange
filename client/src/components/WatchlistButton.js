// src/components/WatchlistButton.js
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

function WatchlistButton({ postId, textbookId }) {
  const { user, watchlistPosts, setWatchlistPosts } = useContext(UserContext);

  const isInWatchlist = (postId) => {
    return watchlistPosts ? watchlistPosts.some((post) => post.id === postId) : false;
  };

  const addToWatchlist = async () => {
    try {
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, textbook_id: textbookId }),
      });

      if (response.ok) {
        const updatedWatchlist = await response.json();
        setWatchlistPosts(updatedWatchlist);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async () => {
    try {
      await fetch(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE',
      });
      setWatchlistPosts(watchlistPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  return (
    <button
      onClick={isInWatchlist(postId) ? removeFromWatchlist : addToWatchlist}
    >
      {isInWatchlist(postId) ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export default WatchlistButton;