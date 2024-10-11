// src/pages/LoginAndRegister.js
import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function LoginAndRegister() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const history = useHistory();
  const { login } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        login(data);
        history.push('/');
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: signupEmail, password: signupPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        login(data);
        history.push('/');
      })
      .catch((error) => {
        console.error('Signup error:', error);
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
          <h2>Login</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={loginEmail} 
            onChange={(e) => setLoginEmail(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <button type="submit" style={{ margin: '10px 0', padding: '5px' }}>Login</button>
        </form>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
          <h2>Sign Up</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={signupEmail} 
            onChange={(e) => setSignupEmail(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={signupPassword} 
            onChange={(e) => setSignupPassword(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <button type="submit" style={{ margin: '10px 0', padding: '5px' }}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default LoginAndRegister;