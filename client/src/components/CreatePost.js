import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PostContext } from '../contexts/PostContext';

function CreatePost({ onNewPostCreated }) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const { user } = useContext(UserContext);
  const { addPost } = useContext(PostContext);

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
            setImageUrl(result.info.public_id);
          } else if (error) {
            console.error('Upload error:', error);
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
    if (!price) validationErrors.price = 'Price is required';
    if (!condition) validationErrors.condition = 'Condition is required';

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
    formData.append('image_public_id', imageUrl);

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        addPost(newPost);
        
        // Reset form fields
        setAuthor('');
        setTitle('');
        setIsbn('');
        setPrice('');
        setCondition('');
        setImageUrl('');
        setErrors({});

        // Call the onNewPostCreated function passed from the parent component
        onNewPostCreated();
      } else {
        console.error('Failed to create post');
        // Display error message to the user
        setErrors({ submit: 'Failed to create post. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Display error message to the user
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="create-post-form">
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            aria-required="true"
            aria-invalid={errors.isbn ? 'true' : 'false'}
          />
          {errors.isbn && <span className="error">{errors.isbn}</span>}
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
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <input
            type="text"
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            aria-required="true"
            aria-invalid={errors.condition ? 'true' : 'false'}
          />
          {errors.condition && <span className="error">{errors.condition}</span>}
        </div>
        <div className="form-group">
          <button type="button" onClick={handleImageUpload} className="btn btn-secondary">
            Upload Image
          </button>
          {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '200px' }} />}
        </div>
        {errors.submit && <div className="error">{errors.submit}</div>}
        <button type="submit" className="btn btn-success">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;