import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';

function AccountDetails() {
  const { user, setUser } = useContext(UserContext);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await axios.delete('/users', { data: { id: user.id } });
        setUser(null);
        // Redirect the user to the login page or any other appropriate page
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div>
      <h2>Account Details</h2>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          {/* Add more account details as needed */}
          <button onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      ) : (
        <p>Please log in to view your account details.</p>
      )}
    </div>
  );
}

export default AccountDetails;