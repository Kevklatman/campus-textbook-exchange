import React, { useState, useEffect } from 'react';

function EditPostForm({ post, onUpdatePost, onCancel }) {
  const [editedPost, setEditedPost] = useState(post);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const conditionOptions = ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const validateForm = () => {
    const errors = [];
    
    if (!editedPost.textbook.title?.trim()) errors.push("Title is required");
    if (!editedPost.textbook.author?.trim()) errors.push("Author is required");
    if (!editedPost.textbook.isbn) {
      errors.push("ISBN is required");
    } else if (!/^\d{13}$/.test(editedPost.textbook.isbn)) {
      errors.push("ISBN must be a 13-digit number");
    }
    if (!editedPost.textbook.subject) errors.push("Subject is required");
    if (!editedPost.price) {
      errors.push("Price is required");
    } else if (isNaN(editedPost.price) || parseFloat(editedPost.price) <= 0) {
      errors.push("Price must be a positive number");
    }
    if (!editedPost.condition) errors.push("Condition is required");

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    
    if (name === 'title' || name === 'author' || name === 'isbn' || name === 'subject') {
      setEditedPost(prev => ({
        ...prev,
        textbook: {
          ...prev.textbook,
          [name]: value,
        },
      }));
    } else {
      setEditedPost(prev => ({
        ...prev,
        [name]: name === 'price' ? parseFloat(value) : value,
      }));
    }
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
            setNewImage(result.info.public_id);
            setSuccess('Image uploaded successfully');
            setEditedPost(prev => ({
              ...prev,
              image_public_id: result.info.public_id
            }));
          } else if (error) {
            setError('Error uploading image. Please try again.');
          }
        }
      ).open();
    } else {
      setError('Image upload is not available. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedPostData = {
        ...editedPost,
        image_public_id: newImage || editedPost.image_public_id
      };

      await onUpdatePost(updatedPostData);
      setSuccess('Post updated successfully!');
    } catch (error) {
      setError(error.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="create-post-title">Edit Post</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={editedPost.textbook.title || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={editedPost.textbook.author || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={editedPost.textbook.isbn || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="13-digit ISBN"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            name="subject"
            value={editedPost.textbook.subject || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select subject</option>
            {subjectOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={editedPost.price || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            name="condition"
            value={editedPost.condition || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select condition</option>
            {conditionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <button 
            type="button" 
            onClick={handleImageUpload} 
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            {newImage ? 'Change Image' : 'Change Cover Image'}
          </button>
          {(newImage || editedPost.image_url) && (
            <div className="image-preview">
              <img 
                src={newImage ? 
                  `https://res.cloudinary.com/duhjluee1/image/upload/${newImage}` 
                  : editedPost.image_url
                } 
                alt="Post cover" 
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPostForm;