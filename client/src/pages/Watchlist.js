// src/pages/Watchlist.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import PostList from '../components/PostList';

function Watchlist() {
  const { user, watchlistPosts, setWatchlistPosts } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlistPosts = async () => {
      try {
        const response = await fetch(`/users/${user.id}/watchlist`);
        const data = await response.json();
        setWatchlistPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchWatchlistPosts();
    }
  }, [user, setWatchlistPosts]);

  const removeFromWatchlist = async (postId) => {
    try {
      await fetch(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE',
      });
      setWatchlistPosts(watchlistPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Watchlist</h1>
      <PostList posts={watchlistPosts} onRemoveFromWatchlist={removeFromWatchlist} />
    </div>
  );
}

export default Watchlist;