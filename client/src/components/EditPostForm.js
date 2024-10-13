// src/components/EditPostForm.js
import React, { useState } from 'react';

function EditPostForm({ post, onUpdatePost, onCancel }) {
  const [editedPost, setEditedPost] = useState(post);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdatePost(editedPost);
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
      <button type="submit">Update</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default EditPostForm;