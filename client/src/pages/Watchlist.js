import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Watchlist = ({ userId }) => {
  const [watchlistItems, setWatchlistItems] = useState([]);

  useEffect(() => {
    fetchWatchlistItems();
  }, []);

  const fetchWatchlistItems = async () => {
    try {
      const response = await axios.get(`/users/${userId}/watchlist`);
      setWatchlistItems(response.data);
    } catch (error) {
      console.error('Error fetching watchlist items:', error);
    }
  };

  const removeFromWatchlist = async (postId) => {
    try {
      await axios.delete(`/users/${userId}/watchlist/${postId}`);
      setWatchlistItems((prevItems) =>
        prevItems.filter((item) => item.id !== postId)
      );
    } catch (error) {
      console.error('Error removing item from watchlist:', error);
    }
  };

  return (
    <div>
      <h2>Watchlist</h2>
      {watchlistItems.map((item) => (
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