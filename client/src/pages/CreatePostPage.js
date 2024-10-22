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
        <h2 className="create-post-title">Create Post</h2>
        <div className="create-post-content">
          <CreatePost onNewPostCreated={handleNewPostCreated} />
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;