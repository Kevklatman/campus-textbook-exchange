// src/components/Header.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

function Header() {
  const { user, logout } = useContext(UserContext);

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              <li>Welcome, {user.email}!</li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login / Register</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;