// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function Navbar() {
  const { user, logout } = useContext(UserContext);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f0f0f0' }}>
      <div>
        <Link to="/" style={{ margin: '0 10px', textDecoration: 'none', color: 'black' }}>Home</Link>
        {user && (
          <>
            <Link to="/create-post" style={{ margin: '0 10px', textDecoration: 'none', color: 'black' }}>Create Post</Link>
            <Link to="/my-posts" style={{ margin: '0 10px', textDecoration: 'none', color: 'black' }}>My Posts</Link>
            <Link to="/watchlist" style={{ margin: '0 10px', textDecoration: 'none', color: 'black' }}>Watchlist</Link>
            <Link to="/account" style={{ margin: '0 10px', textDecoration: 'none', color: 'black' }}>Account Details</Link> {/* Add this link */}
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '10px' }}>Welcome, {user.email}</span>
            <button onClick={logout}>Sign Out</button>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: 'black' }}>Login/Sign Up</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;