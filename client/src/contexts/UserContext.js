import React, { createContext, useState, useEffect, useCallback } from "react";
import { useHistory } from 'react-router-dom';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const fetchWatchlist = useCallback(async (userId) => {
    try {
      const response = await fetch(`/users/${userId}/watchlist`, {
        credentials: 'include'
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
        credentials: 'include'
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

  const login = async (userData) => {
    try {
      setUser(userData);
      if (userData.id) {
        await fetchWatchlist(userData.id);
        await fetchNotifications(userData.id);
      }
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
        history.push('/login');
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/check_session", {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          if (userData.id) {
            await fetchWatchlist(userData.id);
            await fetchNotifications(userData.id);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const addToWatchlist = async (postId, textbookId) => {
    if (!user) return;
    try {
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
        credentials: 'include'
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
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
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
      loading,
      watchlistPosts,
      addToWatchlist,
      removeFromWatchlist,
      fetchWatchlist,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      fetchNotifications
    }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;