import React, { useState, useEffect } from 'react';

function EditPostForm({ post, onUpdatePost, onCancel }) {
  const [editedPost, setEditedPost] = useState(post);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    // Load the Cloudinary widget script
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
    if (name === 'title' || name === 'author' || name === 'isbn') {
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
          cloudName: 'duhjluee1', // Replace with your cloud name
          uploadPreset: 'unsigned', // Replace with your upload preset
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('price', editedPost.price);
    formData.append('condition', editedPost.condition);
    formData.append('title', editedPost.textbook.title);
    formData.append('author', editedPost.textbook.author);
    formData.append('isbn', editedPost.textbook.isbn);
    if (newImage) {
      formData.append('image_public_id', newImage);
    }
    onUpdatePost(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={editedPost.textbook.title}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          id="author"
          name="author"
          value={editedPost.textbook.author}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="isbn">ISBN:</label>
        <input
          type="text"
          id="isbn"
          name="isbn"
          value={editedPost.textbook.isbn}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={editedPost.price}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="condition">Condition:</label>
        <input
          type="text"
          id="condition"
          name="condition"
          value={editedPost.condition}
          onChange={handleChange}
        />
      </div>
      <div>
        <button type="button" onClick={handleImageUpload}>
          {newImage ? 'Change Image' : 'Upload New Image'}
        </button>
        {(newImage || editedPost.image_url) && (
          <img 
            src={newImage || editedPost.image_url} 
            alt="Post" 
            style={{ maxWidth: '200px' }} 
          />
        )}
      </div>
      <button className="btn-success" type="submit">Update</button>
<button className="btn-secondary" type="button" onClick={onCancel}>
  Cancel
</button>
    </form>
  );
}

export default EditPostForm;