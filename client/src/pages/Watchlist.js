// src/components/Watchlist.js
import React, { useEffect, useContext } from 'react';
import { PostContext } from '../contexts/PostContext';
import { UserContext } from '../contexts/UserContext';

const Watchlist = () => {
  const { watchlistPosts, setWatchlistPosts } = useContext(PostContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchWatchlistItems();
  }, []);

  const fetchWatchlistItems = async () => {
    try {
      const response = await fetch(`/users/${user.id}/watchlist`);
      const data = await response.json();
      setWatchlistPosts(data);
    } catch (error) {
      console.error('Error fetching watchlist items:', error);
    }
  };

  const removeFromWatchlist = async (postId) => {
    try {
      await fetch(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE',
      });
      setWatchlistPosts((prevItems) => prevItems.filter((item) => item.id !== postId));
    } catch (error) {
      console.error('Error removing item from watchlist:', error);
    }
  };

  return (
    <div>
      <h2>Watchlist</h2>
      {watchlistPosts.map((item) => (
        <div key={item.id}>
          <h3>{item.textbook.title}</h3>
          <p>Price: {item.price}</p>
          <p>Condition: {item.condition}</p>
          <button onClick={() => removeFromWatchlist(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default Watchlist;