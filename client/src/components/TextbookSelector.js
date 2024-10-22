import React, { useState, useEffect } from 'react';

const TextbookSelector = ({ onSelect }) => {
  const [textbooks, setTextbooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTextbooks, setFilteredTextbooks] = useState([]);

  useEffect(() => {
    // Fetch textbooks when component mounts
    fetch('/textbooks')
      .then(res => res.json())
      .then(data => {
        setTextbooks(data);
        setFilteredTextbooks(data);
      })
      .catch(error => console.error('Error fetching textbooks:', error));
  }, []);

  useEffect(() => {
    const filtered = textbooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toString().includes(searchTerm)
    );
    setFilteredTextbooks(filtered);
  }, [searchTerm, textbooks]);

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
          className="text-input"
        />
      </div>
      <div className="textbook-list">
        {filteredTextbooks.map(book => (
          <div 
            key={book.id} 
            className="textbook-item hover:bg-gray-100 p-2 cursor-pointer rounded"
            onClick={() => onSelect(book)}
          >
            <h4 className="font-semibold">{book.title}</h4>
            <p className="text-sm text-gray-600">By: {book.author}</p>
            <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextbookSelector;