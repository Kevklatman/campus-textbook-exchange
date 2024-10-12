// src/pages/CreatePostPage.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import CreatePost from '../components/CreatePost';

function CreatePostPage() {
  const history = useHistory();

  const handleNewPostCreated = () => {
    // Redirect to the home page after successful post creation
    history.push('/');
  };

  return (
    <div>
      <h2>Create Post</h2>
      <CreatePost onNewPostCreated={handleNewPostCreated} />
    </div>
  );
}

export default CreatePostPage;