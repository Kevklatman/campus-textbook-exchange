import React, { useState, useEffect, useContext } from 'react';
import { PostContext } from '../contexts/PostContext';

function EditPostForm({ post, onUpdatePost, onCancel }) {
  const [editedPost, setEditedPost] = useState(post);
  const [newImage, setNewImage] = useState(null);
  const { updatePost } = useContext(PostContext);

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
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'author' || name === 'isbn' || name === 'subject') {
      setEditedPost((prevPost) => ({
        ...prevPost,
        textbook: {
          ...prevPost.textbook,
          [name]: value,
        },
      }));
    } else {
      setEditedPost((prevPost) => ({
        ...prevPost,
        [name]: value,
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
            console.log('Done! Here is the image info: ', result.info);
            setNewImage(result.info.public_id);
          }
        }
      ).open();
    } else {
      console.error('Cloudinary widget is not loaded yet');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
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
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      updatePost(updatedPost);
      onUpdatePost(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h2 className="create-post-title">Edit Post</h2>
        <div className="create-post-content">
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editedPost.textbook.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author:</label>
              <input
                type="text"
                id="author"
                name="author"
                value={editedPost.textbook.author}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN:</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={editedPost.textbook.isbn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <select
                id="subject"
                name="subject"
                value={editedPost.textbook.subject || ''}
                onChange={handleChange}
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
                value={editedPost.price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition:</label>
              <select
                id="condition"
                name="condition"
                value={editedPost.condition}
                onChange={handleChange}
              >
                {conditionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button type="button" onClick={handleImageUpload} className="btn btn-secondary">
                {newImage ? 'Change Image' : 'Change Cover Image'}
              </button>
              {(newImage || editedPost.image_url) && (
                <div className="image-preview">
                  <img 
                    src={newImage ? `https://res.cloudinary.com/duhjluee1/image/upload/${newImage}` : editedPost.image_url} 
                    alt="Post cover" 
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
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