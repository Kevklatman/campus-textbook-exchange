// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import '../index.css';

function Navbar() {
  const { user, logout } = useContext(UserContext);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-link">Home</Link>
        {user && (
          <>
            <Link to="/create-post" className="navbar-link">Create Post</Link>
            <Link to="/my-posts" className="navbar-link">My Posts</Link>
            <Link to="/watchlist" className="navbar-link">Watchlist</Link>
            <Link to="/account" className="navbar-link">Account Details</Link>
          </>
        )}
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-welcome">Welcome, {user.email}</span>
            <button className="navbar-logout" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <Link to="/login" className="navbar-link">Login/Sign Up</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;