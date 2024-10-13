// src/pages/Home.js
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

function Home() {
  const { user } = useContext(UserContext);
  const { posts } = useContext(PostContext);

  return (
    <div className="home-container">
      <h1>Campus Textbook Exchange</h1>
      {user ? (
        <div>
          <PostList posts={posts} />
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