// src/pages/CreatePostPage.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import '../index.css'

function CreatePostPage() {
  const history = useHistory();

  const handleNewPostCreated = () => {
    history.push('/');
  };

  return (
    <div className="create-post-page">
      <div className="container">
      <button className="btn-success" type="submit">Create Post</button>
      <div className="create-post-content">
          <CreatePost onNewPostCreated={handleNewPostCreated} />
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;