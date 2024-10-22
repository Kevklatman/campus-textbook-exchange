import React, { useState, useEffect } from 'react';

const TextbookSelector = ({ onSelect }) => {
  const [textbooks, setTextbooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTextbooks, setFilteredTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/textbooks')
      .then(res => res.json())
      .then(data => {
        setTextbooks(data);
        setFilteredTextbooks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching textbooks:', error);
        setError('Failed to load textbooks. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = textbooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toString().includes(searchTerm)
    );
    setFilteredTextbooks(filtered);
  }, [searchTerm, textbooks]);

  if (loading) {
    return <div className="textbook-selector">Loading textbooks...</div>;
  }

  if (error) {
    return <div className="textbook-selector error-message">{error}</div>;
  }

  return (
    <div className="textbook-selector">
      <div className="form-group">
        <label htmlFor="textbook-search">Search Existing Textbooks:</label>
        <input
          type="text"
          id="textbook-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="form-control"
        />
      </div>
      
      <div className="textbook-list">
        {filteredTextbooks.length > 0 ? (
          filteredTextbooks.map(book => (
            <div 
              key={book.id} 
              className="textbook-item"
              onClick={() => onSelect(book)}
            >
              <h4>{book.title}</h4>
              <p>By: {book.author}</p>
              <p>ISBN: {book.isbn}</p>
              {book.subject && <p>Subject: {book.subject}</p>}
            </div>
          ))
        ) : (
          <div className="textbook-item">
            <p>No textbooks found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextbookSelector;