// src/pages/Home.js
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { Link } from "react-router-dom";

function Home() {
  const { user, logout } = useContext(UserContext);

  return (
    <div className="home-container">
      <h1>Welcome to Our App</h1>
      {user ? (
        <div>
          <p>Hello, {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in or register to access all features.</p>
          <Link to="/login">Login / Register</Link>
        </div>
      )}
    </div>
  );
}

export default Home;