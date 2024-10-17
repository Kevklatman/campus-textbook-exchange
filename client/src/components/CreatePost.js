import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function CreatePost({ onNewPostCreated }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const { user } = useContext(UserContext);

  if (!user) {
    return <Redirect to="/login" />;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform form validation
    const validationErrors = {};
    if (!author) validationErrors.author = 'Author is required';
    if (!title) validationErrors.title = 'Title is required';
    if (!isbn) {
      validationErrors.isbn = 'ISBN is required';
    } else if (!/^\d{13}$/.test(isbn)) {
      validationErrors.isbn = 'ISBN must be a 13-digit number';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append('author', author);
    formData.append('title', title);
    formData.append('isbn', isbn);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('user_id', user.id);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Post created successfully, reset form fields
        setAuthor('');
        setTitle('');
        setIsbn('');
        setPrice('');
        setCondition('');
        setImageFile(null);
        setImagePreview('');
        setErrors({});

        // Call the onNewPostCreated function passed from the Home component
        onNewPostCreated();
      } else {
        console.error('Failed to create post');
        // Display error message to the user
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Display error message to the user
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-required="true"
            aria-invalid={errors.author ? 'true' : 'false'}
          />
          {errors.author && <span>{errors.author}</span>}
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
          />
          {errors.title && <span>{errors.title}</span>}
        </div>
        <div>
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            aria-required="true"
            aria-invalid={errors.isbn ? 'true' : 'false'}
          />
          {errors.isbn && <span>{errors.isbn}</span>}
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="text"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="condition">Condition:</label>
          <input
            type="text"
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            onChange={handleImageUpload}
            accept="image/*"
          />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px' }} />}
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;