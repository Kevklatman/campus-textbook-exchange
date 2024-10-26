import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function ProtectedRoute({ component: Component, ...rest }) {
  const { user, loading } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={props => {
        // Show loading state while checking authentication
        if (loading) {
          return <div>Loading...</div>;
        }
        
        // If we're not loading and have a user, render the component
        if (user) {
          return <Component {...props} />;
        }
        
        // If we're not loading and don't have a user, redirect to login
        return (
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