import React from 'react';
import { useHistory } from 'react-router-dom';
import CreatePost from '../components/CreatePost';

function CreatePostPage() {
  const history = useHistory();

  const handleNewPostCreated = () => {
    history.push('/');
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h2 className="create-post-title">Create a New Post</h2>
        <div className="create-post-content">
          <CreatePost onNewPostCreated={handleNewPostCreated} />
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;