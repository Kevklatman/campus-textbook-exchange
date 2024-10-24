import React, { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // Function to fetch CSRF token
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/csrf_token', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrf_token);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // Headers with CSRF token for non-GET requests
  const getHeaders = () => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  });

  const fetchWatchlist = useCallback(async (userId) => {
    try {
      const response = await fetch(`/users/${userId}/watchlist`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
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
      const response = await fetch(`/users/${userId}/notifications`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const notificationsData = await response.json();
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/check_session", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await Promise.all([
          fetchWatchlist(userData.id),
          fetchNotifications(userData.id)
        ]);
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setUser(null);
      setWatchlistPosts([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWatchlist, fetchNotifications]);

  // Initialize CSRF token and check session
  useEffect(() => {
    fetchCsrfToken().then(() => {
      checkSession();
    });
  }, [checkSession]);

  const login = async (userData) => {
    setUser(userData);
    await Promise.all([
      fetchWatchlist(userData.id),
      fetchNotifications(userData.id)
    ]);
  };

  const logout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        credentials: 'include',
        headers: getHeaders()
      });

      if (response.ok) {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addToWatchlist = async (postId, textbookId) => {
    if (!user) return;
    try {
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
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
      const response = await fetch(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders()
      });

      if (response.ok) {
        setWatchlistPosts((prevWatchlist) => 
          prevWatchlist.filter((post) => post.id !== postId)
        );
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
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

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/users/${user.id}/notifications`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders()
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

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
      markAllNotificationsAsRead,
      fetchNotifications,
      loading,
      csrfToken
    }}>
      {children}
    </UserContext.Provider>
  );
}