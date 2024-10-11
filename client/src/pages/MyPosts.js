// src/pages/MyPosts.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import PostList from '../components/PostList';

function MyPosts() {
  const { user } = useContext(UserContext);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await fetch(`/posts?user_id=${user.id}`);
        const data = await response.json();
        setMyPosts(data);
      } catch (error) {
        console.error('Error fetching my posts:', error);
      }
    };

    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to view your posts.</div>;
  }

  return (
    <div>
      <h2>My Posts</h2>
      <PostList posts={myPosts} />
    </div>
  );
}

export default MyPosts;