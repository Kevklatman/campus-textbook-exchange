import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';

function Home() {
  const { user } = useContext(UserContext);
  const { posts, setWatchlistPosts } = useContext(PostContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(posts);

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
  }, [searchTerm, posts]);

  const handleAddToWatchlist = async (postId, textbookId) => {
    try {
      // Make an API call to add the post to the user's watchlist
      const response = await fetch(`/users/${user.id}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, textbook_id: textbookId }),
      });
  
      if (response.ok) {
        // Fetch the updated watchlist posts
        const updatedWatchlistResponse = await fetch(`/users/${user.id}/watchlist`);
        if (updatedWatchlistResponse.ok) {
          const updatedWatchlist = await updatedWatchlistResponse.json();
          setWatchlistPosts(updatedWatchlist);
        } else {
          console.error('Error fetching updated watchlist');
        }
      } else {
        console.error('Error adding post to watchlist');
      }
    } catch (error) {
      console.error('Error adding post to watchlist:', error);
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