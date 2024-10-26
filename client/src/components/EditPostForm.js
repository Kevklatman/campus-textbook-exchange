import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';
import { useHistory } from 'react-router-dom';

function EditPostForm({ post, onUpdatePost, onCancel }) {
  const { user, csrfToken } = useContext(UserContext);
  const { updatePost } = useContext(PostContext);
  const history = useHistory();

  // Form state
  const [editedPost, setEditedPost] = useState(post);
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(post.image_url);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Security check
  useEffect(() => {
    if (user?.id !== post.user_id) {
      history.push('/');
    }
  }, [user, post.user_id, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'author' || name === 'isbn' || name === 'subject') {
      setEditedPost(prevPost => ({
        ...prevPost,
        textbook: {
          ...prevPost.textbook,
          [name]: value,
        },
      }));
    } else {
      setEditedPost(prevPost => ({
        ...prevPost,
        [name]: value,
      }));
    }
    // Clear error for the changed field
    setErrors(prev => ({ ...prev, [name]: null }));
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
            setNewImage(result.info.public_id);
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
    
    if (!editedPost.textbook.title.trim()) {
      validationErrors.title = 'Title is required';
    }
    
    if (!editedPost.textbook.author.trim()) {
      validationErrors.author = 'Author is required';
    }
    
    if (!editedPost.textbook.subject) {
      validationErrors.subject = 'Subject is required';
    }
    
    if (!editedPost.textbook.isbn) {
      validationErrors.isbn = 'ISBN is required';
    } else if (!/^\d{13}$/.test(editedPost.textbook.isbn)) {
      validationErrors.isbn = 'ISBN must be a 13-digit number';
    }
    
    if (!editedPost.price) {
      validationErrors.price = 'Price is required';
    } else if (isNaN(editedPost.price) || Number(editedPost.price) <= 0) {
      validationErrors.price = 'Price must be a positive number';
    }
    
    if (!editedPost.condition) {
      validationErrors.condition = 'Condition is required';
    }
    
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
    formData.append('price', editedPost.price);
    formData.append('condition', editedPost.condition);
    formData.append('title', editedPost.textbook.title);
    formData.append('author', editedPost.textbook.author);
    formData.append('isbn', editedPost.textbook.isbn);
    formData.append('subject', editedPost.textbook.subject);
    if (newImage) {
      formData.append('image_public_id', newImage);
    }

    try {
      const response = await fetch(`/posts/${editedPost.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      const updatedPost = await response.json();
      updatePost(updatedPost);
      setSuccessMessage('Post updated successfully!');
      
      // Wait briefly to show success message
      setTimeout(() => {
        if (onUpdatePost) {
          onUpdatePost(updatedPost);
        }
      }, 1000);

    } catch (error) {
      console.error('Error updating post:', error);
      setErrors({
        submit: error.message || 'An error occurred while updating the post. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id !== post.user_id) {
    return <div>Unauthorized to edit this post.</div>;
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h2 className="create-post-title">Edit Post</h2>
        
        <div className="create-post-content">
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

          <form onSubmit={handleSubmit} className="create-post-form">
            <input type="hidden" name="csrf_token" value={csrfToken} />

            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editedPost.textbook.title}
                onChange={handleChange}
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
                name="author"
                value={editedPost.textbook.author}
                onChange={handleChange}
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
                name="isbn"
                value={editedPost.textbook.isbn}
                onChange={handleChange}
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
                name="subject"
                value={editedPost.textbook.subject || ''}
                onChange={handleChange}
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
                name="price"
                value={editedPost.price}
                onChange={handleChange}
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
                name="condition"
                value={editedPost.condition}
                onChange={handleChange}
                disabled={loading}
                className={errors.condition ? 'error' : ''}
                aria-invalid={errors.condition ? 'true' : 'false'}
              >
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
                className="btn btn-secondary"
                disabled={loading}
              >
                {newImage || previewImage ? 'Change Image' : 'Add Image'}
              </button>
              {(previewImage || newImage) && (
                <div className="image-preview">
                  <img 
                    src={previewImage}
                    alt="Post cover" 
                    className="preview-image"
                  />
                </div>
              )}
              {errors.image && <span className="error">{errors.image}</span>}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPostForm;