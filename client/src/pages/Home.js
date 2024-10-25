import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';
import LocationRadiusSelector from '../components/LocationRadiusSelector';
import { Search, Filter, X } from 'lucide-react';

function Home() {
  const { user, watchlistPosts, addToWatchlist, removeFromWatchlist } = useContext(UserContext);
  const { posts, fetchAllPosts } = useContext(PostContext);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(10);
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price', 'distance'

  const subjects = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Psychology'
  ];

  const conditions = [
    'New',
    'Like New',
    'Very Good',
    'Good',
    'Acceptable'
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/posts?';
      
      // Add location parameters if available
      if (location) {
        url += `lat=${location.lat}&lng=${location.lng}&radius=${radius}&`;
      }

      // Add other filter parameters
      if (selectedSubject) url += `subject=${selectedSubject}&`;
      if (selectedCondition) url += `condition=${selectedCondition}&`;
      if (priceRange.min) url += `min_price=${priceRange.min}&`;
      if (priceRange.max) url += `max_price=${priceRange.max}&`;
      if (sortBy) url += `sort=${sortBy}&`;
      if (searchTerm) url += `q=${encodeURIComponent(searchTerm)}&`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setFilteredPosts(data);
    } catch (err) {
      setError('Error fetching posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [location, radius, selectedSubject, selectedCondition, priceRange, sortBy, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    setRadius(newLocation.radius || 10);
  };

  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedCondition('');
    setPriceRange({ min: '', max: '' });
    setSortBy('date');
    setLocation(null);
  };

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
        <div className="home-content">
          {/* Search Bar */}
          <div className="search-section bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by author, title, or ISBN"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="filters-section mt-4 space-y-4">
                <div className="location-filter">
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <LocationRadiusSelector
                    onLocationChange={handleLocationChange}
                    initialRadius={radius}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="filter-group">
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full rounded border-gray-300"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full rounded border-gray-300"
                    >
                      <option value="">Any Condition</option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded border-gray-300"
                    >
                      <option value="date">Most Recent</option>
                      <option value="price">Price: Low to High</option>
                      {location && <option value="distance">Distance</option>}
                    </select>
                  </div>
                </div>

                <div className="price-range grid grid-cols-2 gap-4">
                  <div className="filter-group">
                    <label className="block text-sm font-medium mb-2">Min Price</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full rounded border-gray-300"
                      min="0"
                      placeholder="Min"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="block text-sm font-medium mb-2">Max Price</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full rounded border-gray-300"
                      min="0"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message mb-4">
              {error}
            </div>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <PostList
              posts={filteredPosts}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              showEditButton={false}
              showDistance={!!location}
            />
          )}
        </div>
      ) : (
        <div className="login-prompt-container">
          <p>Please log in or register to access all features.</p>
          <Link to="/login" className="btn btn-primary">Login / Register</Link>
        </div>
      )}
    </div>
  );
}

export default Home;