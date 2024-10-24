import React, { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlistPosts, setWatchlistPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // 1. First, define the basic CSRF token fetching
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

  // 2. Define getHeaders which doesn't depend on other functions
  const getHeaders = useCallback(() => {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf_token='))
      ?.split('=')[1];
    if (cookieToken && !headers['X-CSRF-Token']) {
      headers['X-CSRF-Token'] = cookieToken;
    }
    return headers;
  }, [csrfToken]);

  // 3. Define makeRequest which depends on fetchCsrfToken and getHeaders
  const makeRequest = useCallback(async (url, options = {}) => {
    let token = csrfToken;
    
    if (!token) {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      if (cookieToken) {
        token = cookieToken;
        setCsrfToken(cookieToken);
      } else {
        token = await fetchCsrfToken();
        if (!token) {
          throw new Error('Failed to obtain CSRF token');
        }
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

  // 4. Define data fetching functions that depend on makeRequest
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

  // 5. Define checkSession after its dependencies are declared
  const checkSession = useCallback(async () => {
    try {
      const response = await makeRequest("/check_session");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await Promise.all([
          fetchWatchlist(userData.id),
          fetchNotifications(userData.id)
        ]);
      } else {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setUser(null);
      setWatchlistPosts([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [makeRequest, fetchWatchlist, fetchNotifications]);

  // 6. Initialize app with useEffect
  useEffect(() => {
    const initializeApp = async () => {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      if (cookieToken) {
        setCsrfToken(cookieToken);
      } else {
        await fetchCsrfToken();
      }
      await checkSession();
    };

    initializeApp();

    const intervalId = setInterval(async () => {
      await fetchCsrfToken();
      await checkSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchCsrfToken, checkSession]);

  // 7. Define auth and other functions that depend on makeRequest
  const login = async (userData) => {
    try {
      const response = await makeRequest("/login", {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          remember: true
        }),
        headers: userData.headers  // Include any additional headers passed
      });
  
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        await Promise.all([
          fetchWatchlist(data.id),
          fetchNotifications(data.id)
        ]);
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

  const refreshUserData = async () => {
    if (user) {
      await Promise.all([
        fetchWatchlist(user.id),
        fetchNotifications(user.id)
      ]);
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
      makeRequest,
      csrfToken,
      refreshUserData
    }}>
      {children}
    </UserContext.Provider>
  );
}