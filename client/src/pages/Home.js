// src/pages/Home.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

function Home() {
  const { user } = useContext(UserContext);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await fetch('/posts');
        const data = await response.json();
        setAllPosts(data);
      } catch (error) {
        console.error('Error fetching all posts:', error);
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <div className="home-container">
      <h1>Welcome to Our App</h1>
      {user ? (
        <div>
          <p>You are logged in as {user.email}.</p>
          <PostList posts={allPosts} />
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