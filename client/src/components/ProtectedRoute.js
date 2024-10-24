// ProtectedRoute.js
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function ProtectedRoute({ component: Component, ...rest }) {
  const { user, loading } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={props => {
        if (loading) {
          return (
            <div className="loading-container">
              <div className="loading-spinner">Loading...</div>
            </div>
          );
        }
        
        return user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        );
      }}
    />
  );
}

export default ProtectedRoute;