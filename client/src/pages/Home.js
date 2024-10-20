import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

function Home() {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);
  const { posts, fetchAllPosts } = useContext(PostContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const filtered = posts.filter((post) => {
      if (post.textbook) {
        const { author, title, isbn } = post.textbook;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
          (author && author.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (title && title.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (isbn && isbn.toString().includes(lowerCaseSearchTerm))
        );
      }
      return false;
    });
    setFilteredPosts(filtered);
  }, [searchTerm, posts, watchlistPosts]);

  const handleAddToWatchlist = async (postId, textbookId) => {
    if (user) {
      await addToWatchlist(postId, textbookId);
    }
  };

  const handleRemoveFromWatchlist = async (postId) => {
    if (user) {
      await removeFromWatchlist(postId);
    }
  };

  return (
    <div className="home-container">
      <h1>Campus Textbook Exchange</h1>
      {user ? (
        <div>
          <input
            type="text"
            placeholder="Search by author, title, or ISBN"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <PostList
            posts={filteredPosts}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            watchlistPosts={watchlistPosts}
          />
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