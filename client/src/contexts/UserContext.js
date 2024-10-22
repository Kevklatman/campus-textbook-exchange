import React, { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async (userId) => {
    try {
      const response = await fetch(`/users/${userId}/watchlist`);
      if (response.ok) {
        const watchlistData = await response.json();
        setWatchlistPosts(watchlistData || []);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setWatchlistPosts([]);
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    fetch("/check_session")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Not authenticated');
        }
      })
      .then((userData) => {
        setUser(userData);
        fetchWatchlist(userData.id);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        setUser(null);
        setWatchlistPosts([]);
        setLoading(false);
      });
  }, [fetchWatchlist]);

  const login = (userData) => {
    setUser(userData);
    fetchWatchlist(userData.id);
  };

  const logout = () => {
    fetch("/logout", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          setUser(null);
          setWatchlistPosts([]);
          window.location.href = '/login';
        } else {
          throw new Error('Logout failed');
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const addToWatchlist = async (postId, textbookId) => {
    if (!user) return;
    try {
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, textbook_id: textbookId }),
      });

      if (response.ok) {
        const newWatchlistItem = await response.json();
        setWatchlistPosts(prevWatchlist => [...prevWatchlist, newWatchlistItem]);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (postId) => {
    if (!user) return;
    try {
      await fetch(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE',
      });
      setWatchlistPosts((prevWatchlist) => prevWatchlist.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      watchlistPosts,
      addToWatchlist,
      removeFromWatchlist,
      fetchWatchlist
    }}>
      {children}
    </UserContext.Provider>
  );
}