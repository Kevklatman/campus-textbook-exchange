// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    fetch("/logout", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          setUser(null);
        } else {
          throw new Error('Logout failed');
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}