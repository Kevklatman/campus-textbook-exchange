// src/components/WatchlistButton.js
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

function WatchlistButton({ postId, textbookId }) {
  const { user, watchlistPosts, setWatchlistPosts } = useContext(UserContext);

  const isInWatchlist = (postId) => {
    return watchlistPosts.some((post) => post.id === postId);
  };

  const addToWatchlist = async (postId, textbookId) => {
    try {
      // Make an API call to add the post to the user's watchlist
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, textbook_id: textbookId }),
      });
  
      if (response.ok) {
        // Fetch the updated watchlist posts
        const updatedWatchlist = await response.json();
        setWatchlistPosts(updatedWatchlist);
      } else {
        console.error('Error adding post to watchlist');
      }
    } catch (error) {
      console.error('Error adding post to watchlist:', error);
    }
  };
  
  const removeFromWatchlist = async (postId) => {
    try {
      // Make an API call to remove the post from the user's watchlist
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });
  
      if (response.ok) {
        // Fetch the updated watchlist posts
        const updatedWatchlist = await response.json();
        setWatchlistPosts(updatedWatchlist);
      } else {
        console.error('Error removing post from watchlist');
      }
    } catch (error) {
      console.error('Error removing post from watchlist:', error);
    }
  };

  return (
    <button onClick={() => (isInWatchlist(postId) ? removeFromWatchlist(postId) : addToWatchlist(postId, textbookId))}>
      {isInWatchlist(postId) ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export default WatchlistButton;