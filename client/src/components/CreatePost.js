import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import TextbookSelector from './TextbookSelector';

function CreatePost({ onNewPostCreated }) {
  const { user } = useContext(UserContext);
  const { addPost } = useContext(PostContext);
  
  // Form state
  const [showSelector, setShowSelector] = useState(false);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load Cloudinary widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const subjectOptions = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Psychology',
    'Other'
  ];

  const conditionOptions = [
    'New',
    'Like New',
    'Very Good',
    'Good',
    'Acceptable'
  ];

  const handleTextbookSelect = (textbook) => {
    setAuthor(textbook.author);
    setTitle(textbook.title);
    setIsbn(textbook.isbn.toString());
    if (textbook.subject) {
      setSubject(textbook.subject);
    }
    setShowSelector(false);
    setErrors(prev => ({
      ...prev,
      author: null,
      title: null,
      isbn: null,
      subject: null
    }));
  };

  const handleImageUpload = () => {
    if (window.cloudinary) {
      window.cloudinary.createUploadWidget(
        {
          cloudName: 'duhjluee1',
          uploadPreset: 'unsigned',
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            setImageUrl(result.info.public_id);
            setErrors(prevErrors => ({ ...prevErrors, image: null }));
          } else if (error) {
            console.error('Upload error:', error);
            setErrors(prevErrors => ({ ...prevErrors, image: 'Failed to upload image. Please try again.' }));
          }
        }
      ).open();
    } else {
      console.error('Cloudinary widget is not loaded yet');
      setErrors(prevErrors => ({ ...prevErrors, image: 'Image upload is not available. Please try again later.' }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!author) validationErrors.author = 'Author is required';
    if (!title) validationErrors.title = 'Title is required';
    if (!subject) validationErrors.subject = 'Subject is required';
    if (!isbn) {
      validationErrors.isbn = 'ISBN is required';
    } else if (!/^\d{13}$/.test(isbn)) {
      validationErrors.isbn = 'ISBN must be a 13-digit number';
    }
    if (!price) {
      validationErrors.price = 'Price is required';
    } else if (isNaN(price) || price <= 0) {
      validationErrors.price = 'Price must be a positive number';
    }
    if (!condition) validationErrors.condition = 'Condition is required';
    
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append('author', author);
    formData.append('title', title);
    formData.append('isbn', isbn);
    formData.append('subject', subject);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('user_id', user.id);
    if (imageUrl) {
      formData.append('image_public_id', imageUrl);
    }

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        addPost(data);
        
        // Reset form fields
        setAuthor('');
        setTitle('');
        setIsbn('');
        setSubject('');
        setPrice('');
        setCondition('');
        setImageUrl('');
        setErrors({});
        setShowSelector(false);

        setSuccessMessage('Post created successfully!');
        if (onNewPostCreated) {
          onNewPostCreated();
        }
      } else {
        console.error('Failed to create post:', data);
        setErrors({ submit: data.message || 'Failed to create post. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: 'An error occurred while creating the post. Please try again.' });
    }
  };

  return (
    <div className="create-post-form">
      <div className="mb-4">
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={() => setShowSelector(!showSelector)}
        >
          {showSelector ? 'Hide Textbook Selector' : 'Select Existing Textbook'}
        </button>
      </div>

      {showSelector && (
        <div className="mb-4">
          <TextbookSelector onSelect={handleTextbookSelect} />
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-required="true"
            aria-invalid={errors.author ? 'true' : 'false'}
          />
          {errors.author && <span className="error">{errors.author}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            aria-required="true"
            aria-invalid={errors.isbn ? 'true' : 'false'}
            placeholder="Enter 13-digit ISBN"
          />
          {errors.isbn && <span className="error">{errors.isbn}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-required="true"
            aria-invalid={errors.subject ? 'true' : 'false'}
          >
            <option value="">Select subject</option>
            {subjectOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.subject && <span className="error">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-required="true"
            aria-invalid={errors.price ? 'true' : 'false'}
            min="0"
            step="0.01"
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            aria-required="true"
            aria-invalid={errors.condition ? 'true' : 'false'}
          >
            <option value="">Select condition</option>
            {conditionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.condition && <span className="error">{errors.condition}</span>}
        </div>

        <div className="form-group">
          <button type="button" onClick={handleImageUpload} className="btn btn-secondary">
            {imageUrl ? 'Change Image' : 'Upload Image'}
          </button>
          {imageUrl && (
            <div className="image-preview">
              <img 
                src={`https://res.cloudinary.com/duhjluee1/image/upload/${imageUrl}`} 
                alt="Uploaded textbook" 
              />
            </div>
          )}
          {errors.image && <span className="error">{errors.image}</span>}
        </div>

        <button type="submit" className="btn btn-success">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;