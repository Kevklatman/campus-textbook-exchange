import React, { createContext, useState, useEffect, useCallback } from "react";
import { useHistory } from 'react-router-dom';

export const UserContext = createContext();

export function UserProvider({ children }) {
  // State definitions
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // 1. Base utilities
  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch('/csrf_token', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrf_token);
        return data.csrf_token;
      }
      throw new Error('Failed to fetch CSRF token');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return null;
    }
  }, []);

  const getHeaders = useCallback(() => {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return headers;
  }, [csrfToken]);

  const makeRequest = useCallback(async (url, options = {}) => {
    let token = csrfToken;
    
    if (!token) {
      token = await fetchCsrfToken();
      if (!token) {
        throw new Error('Failed to obtain CSRF token');
      }
    }

    const defaultOptions = {
      credentials: 'include',
      headers: {
        ...getHeaders(),
        'X-CSRF-Token': token
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, finalOptions);
    
    if (response.status === 403) {
      const newToken = await fetchCsrfToken();
      if (newToken) {
        finalOptions.headers['X-CSRF-Token'] = newToken;
        return fetch(url, finalOptions);
      }
    }

    return response;
  }, [csrfToken, getHeaders, fetchCsrfToken]);

  // 2. Data fetching functions
  const fetchWatchlist = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await makeRequest(`/users/${userId}/watchlist`);
      if (response.ok) {
        const watchlistData = await response.json();
        setWatchlistPosts(watchlistData || []);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setWatchlistPosts([]);
    }
  }, [makeRequest]);

  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await makeRequest(`/users/${userId}/notifications`);
      if (response.ok) {
        const notificationsData = await response.json();
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, [makeRequest]);

  // 3. Notification polling functions
  const startNotificationPolling = useCallback(() => {
    if (pollingInterval || !user) return;
    
    const intervalId = setInterval(async () => {
      try {
        const response = await makeRequest(`/users/${user.id}/notifications`);
        if (response.ok) {
          const notificationsData = await response.json();
          setNotifications(notificationsData || []);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 5000);

    setPollingInterval(intervalId);
  }, [user, pollingInterval, makeRequest]);

  const stopNotificationPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // 4. Auth functions
  const login = async (userData) => {
    try {
      const response = await makeRequest("/login", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          remember: true
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        await Promise.all([
          fetchWatchlist(data.id),
          fetchNotifications(data.id)
        ]);
        startNotificationPolling();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await makeRequest("/logout", {
        method: "POST"
      });

      if (response.ok) {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
        stopNotificationPolling();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 5. Watchlist functions
  const addToWatchlist = async (postId, textbookId) => {
    if (!user) return;
    try {
      const response = await makeRequest(`/users/${user.id}/watchlist`, {
        method: 'POST',
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
      const response = await makeRequest(`/users/${user.id}/watchlist/${postId}`, {
        method: 'DELETE'
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

  // 6. Notification functions
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await makeRequest(`/notifications/${notificationId}`, {
        method: 'PATCH',
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
      const response = await makeRequest(`/users/${user.id}/notifications`, {
        method: 'PATCH'
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

  // 7. Utility functions
  const refreshUserData = async () => {
    if (user) {
      await Promise.all([
        fetchWatchlist(user.id),
        fetchNotifications(user.id)
      ]);
    }
  };

  // 8. Session management
  const checkSession = useCallback(async (retryCount = 3) => {
    if (retryCount === 0) {
      throw new Error('Max retries reached');
    }

    try {
      const response = await makeRequest("/check_session");
      
      if (!response.ok) {
        if (response.status === 401) {
          await fetchCsrfToken();
          return checkSession(retryCount - 1);
        }
        throw new Error('Session check failed');
      }

      const userData = await response.json();
      if (userData && !userData.error) {
        setUser(userData);
        
        // Only fetch these if we don't already have them and user changed
        if (watchlistPosts.length === 0) {
          await fetchWatchlist(userData.id);
        }
        if (notifications.length === 0) {
          await fetchNotifications(userData.id);
        }
        
        // Only start polling if logged in and not already polling
        if (!pollingInterval) {
          startNotificationPolling();
        }
      } else {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
        stopNotificationPolling();
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
      setWatchlistPosts([]);
      setNotifications([]);
      stopNotificationPolling();
    } finally {
      setLoading(false);
    }
  }, [makeRequest, fetchCsrfToken, pollingInterval, 
      startNotificationPolling, stopNotificationPolling, 
      fetchWatchlist, fetchNotifications, watchlistPosts.length, 
      notifications.length]);

  // 9. Initialization effect
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      if (!mounted) return;
      try {
        setLoading(true);
        
        if (!csrfToken) {
          await fetchCsrfToken();
        }
        
        if (!user) {
          await checkSession();
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (mounted) {
          setUser(null);
          setWatchlistPosts([]);
          setNotifications([]);
          stopNotificationPolling();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    // Clean up function
    return () => {
      mounted = false;
      stopNotificationPolling();
    };
  }, []); // Empty dependency array - this should only run once on mount

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
      fetchNotifications,
      loading,
      makeRequest,
      csrfToken,
      refreshUserData,
      startNotificationPolling,
      stopNotificationPolling
    }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;