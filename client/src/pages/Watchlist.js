import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

const Watchlist = () => {
  const { user, watchlistPosts, removeFromWatchlist } = useContext(UserContext);

  if (!user) {
    return <div>Please log in to view your watchlist.</div>;
  }

  if (!Array.isArray(watchlistPosts) || watchlistPosts.length === 0) {
    return <div>Your watchlist is empty.</div>;
  }

  return (
    <div>
      <h2>Watchlist</h2>
      {watchlistPosts.map((item) => (
        <div key={item.id}>
          <h3>{item.textbook?.title}</h3>
          <p>Price: {item.price}</p>
          <p>Condition: {item.condition}</p>
          <button onClick={() => removeFromWatchlist(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default Watchlist;