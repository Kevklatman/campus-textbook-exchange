import React, { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  const fetchNotifications = useCallback(async (userId) => {
    try {
      const response = await fetch(`/users/${userId}/notifications`);
      if (response.ok) {
        const notificationsData = await response.json();
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
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
        fetchNotifications(userData.id);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
        setLoading(false);
      });
  }, [fetchWatchlist, fetchNotifications]);

  const login = (userData) => {
    setUser(userData);
    fetchWatchlist(userData.id);
    fetchNotifications(userData.id);
  };

  const logout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
      setUser(null);
      setWatchlistPosts([]);
      setNotifications([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
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
      setWatchlistPosts((prevWatchlist) => 
        prevWatchlist.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      fetchWatchlist,
      notifications,
      markNotificationAsRead,
      fetchNotifications
    }}>
      {children}
    </UserContext.Provider>
  );
}