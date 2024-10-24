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
    return headers;
  }, [csrfToken]);

  // 3. Define makeRequest which depends on fetchCsrfToken and getHeaders
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

  // 5. Define checkSession after its dependencies
  const checkSession = useCallback(async (retryCount = 3) => {
    try {
      const response = await makeRequest("/check_session");
      
      if (!response.ok) {
        if (response.status === 401 && retryCount > 0) {
          await fetchCsrfToken();
          return checkSession(retryCount - 1);
        }
        throw new Error('Session check failed');
      }

      const userData = await response.json();
      if (userData && !userData.error) {
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
      console.error("Session check error:", error);
      setUser(null);
      setWatchlistPosts([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [makeRequest, fetchCsrfToken, fetchWatchlist, fetchNotifications]);

  // 6. Initialize app with useEffect
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        setLoading(true);
        await fetchCsrfToken();
        await checkSession();
      } catch (error) {
        console.error("Initialization error:", error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [fetchCsrfToken, checkSession]);

  // 7. Define remaining functions that depend on makeRequest
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
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Rest of your functions...
  const logout = async () => {
    try {
      const response = await makeRequest("/logout", {
        method: "POST"
      });

      if (response.ok) {
        setUser(null);
        setWatchlistPosts([]);
        setNotifications([]);
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

  // Add these functions after addToWatchlist and before the return statement:

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

  // Include your other functions here...

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