import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function CreatePost({ onNewPostCreated }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const { user } = useContext(UserContext);

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

  if (!user) {
    return <Redirect to="/login" />;
  }

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
            setImageUrl(result.info.secure_url);
          }
        }
      ).open();
    } else {
      console.error('Cloudinary widget is not loaded yet');
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
    formData.append('image', imageUrl);

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
        setImageUrl('');
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
          <button type="button" onClick={handleImageUpload}>
            Upload Image
          </button>
          {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '200px' }} />}
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;