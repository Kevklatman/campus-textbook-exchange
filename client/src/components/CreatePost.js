import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import TextbookSelector from './TextbookSelector';
import LocationRadiusSelector from './LocationRadiusSelector';
import { MapPin, Upload, Book, X } from 'lucide-react';
import { useHistory } from 'react-router-dom';

function CreatePost({ onNewPostCreated }) {
  const { user, csrfToken } = useContext(UserContext);
  const { addPost } = useContext(PostContext);
  const history = useHistory();
  
  // Form state
  const [showSelector, setShowSelector] = useState(false);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending', 'success', 'error'

  const subjectOptions = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Psychology'
  ];

  const conditionOptions = [
    'New',
    'Like New',
    'Very Good',
    'Good',
    'Acceptable'
  ];

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

  const handleLocationChange = (locationData) => {
    setLocation(locationData);
    setLocationStatus('success');
    setErrors(prev => ({ ...prev, location: null }));
  };

  const handleLocationError = (error) => {
    setLocationStatus('error');
    setErrors(prev => ({ 
      ...prev, 
      location: 'Unable to get location. Please try again or enter manually.' 
    }));
  };

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
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5000000, // 5MB
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1"
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            setImageUrl(result.info.public_id);
            setPreviewImage(result.info.secure_url);
            setErrors(prev => ({ ...prev, image: null }));
          } else if (error) {
            console.error('Upload error:', error);
            setErrors(prev => ({
              ...prev,
              image: 'Failed to upload image. Please try again.'
            }));
          }
        }
      ).open();
    } else {
      console.error('Cloudinary widget is not loaded yet');
      setErrors(prev => ({
        ...prev,
        image: 'Image upload is not available. Please try again later.'
      }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!author.trim()) validationErrors.author = 'Author is required';
    if (!subject) validationErrors.subject = 'Subject is required';
    
    if (!isbn) {
      validationErrors.isbn = 'ISBN is required';
    } else if (!/^\d{13}$/.test(isbn)) {
      validationErrors.isbn = 'ISBN must be a 13-digit number';
    }
    
    if (!price) {
      validationErrors.price = 'Price is required';
    } else if (isNaN(price) || Number(price) <= 0) {
      validationErrors.price = 'Price must be a positive number';
    }
    
    if (!condition) validationErrors.condition = 'Condition is required';
    
    if (!location) validationErrors.location = 'Location is required';
    
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('author', author);
    formData.append('title', title);
    formData.append('isbn', isbn);
    formData.append('subject', subject);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('user_id', user.id);

    // Append location data if available
    if (location) {
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
    }

    if (imageUrl) {
      formData.append('image_public_id', imageUrl);
    }

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      addPost(data);
      setSuccessMessage('Post created successfully!');
      
      // Reset form
      setAuthor('');
      setTitle('');
      setIsbn('');
      setSubject('');
      setPrice('');
      setCondition('');
      setImageUrl('');
      setPreviewImage(null);
      setLocation(null);
      setErrors({});
      setShowSelector(false);

      // Redirect or callback
      if (onNewPostCreated) {
        onNewPostCreated();
      } else {
        history.push('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({
        submit: error.message || 'An error occurred while creating the post. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to create a post.</div>;
  }

  return (
    <div className="create-post-form">
      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}
      
      {errors.submit && (
        <div className="error-message" role="alert">
          {errors.submit}
        </div>
      )}

      <div className="mb-4">
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={() => setShowSelector(!showSelector)}
          disabled={loading}
        >
          {showSelector ? (
            <span className="flex items-center">
              <X className="w-4 h-4 mr-2" />
              Hide Textbook Selector
            </span>
          ) : (
            <span className="flex items-center">
              <Book className="w-4 h-4 mr-2" />
              Select Existing Textbook
            </span>
          )}
        </button>
      </div>

      {showSelector && (
        <div className="mb-4">
          <TextbookSelector onSelect={handleTextbookSelect} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="csrf_token" value={csrfToken} />

        <div className="form-group">
          <label htmlFor="location" className="form-label">Location:</label>
          <LocationRadiusSelector
            onLocationChange={handleLocationChange}
            onLocationError={handleLocationError}
          />
          {errors.location && (
            <span className="error">{errors.location}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className={errors.title ? 'error' : ''}
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
            disabled={loading}
            className={errors.author ? 'error' : ''}
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
            placeholder="Enter 13-digit ISBN"
            disabled={loading}
            className={errors.isbn ? 'error' : ''}
            aria-invalid={errors.isbn ? 'true' : 'false'}
          />
          {errors.isbn && <span className="error">{errors.isbn}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
            className={errors.subject ? 'error' : ''}
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
            min="0"
            step="0.01"
            disabled={loading}
            className={errors.price ? 'error' : ''}
            aria-invalid={errors.price ? 'true' : 'false'}
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            disabled={loading}
            className={errors.condition ? 'error' : ''}
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
          <button 
            type="button" 
            onClick={handleImageUpload} 
            className="btn btn-secondary flex items-center"
            disabled={loading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {imageUrl ? 'Change Image' : 'Upload Image'}
          </button>
          {previewImage && (
            <div className="image-preview mt-4">
              <img 
                src={previewImage}
                alt="Book preview" 
                className="preview-image rounded-lg shadow-md"
              />
            </div>
          )}
          {errors.image && <span className="error">{errors.image}</span>}
        </div>

        <button 
          type="submit" 
          className="btn btn-success w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;