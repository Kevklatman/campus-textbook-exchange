// src/components/App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./NavBar";
import LoginAndRegister from "../pages/LoginAndRegister";
import { UserProvider } from "../contexts/UserContext";
import { PostProvider } from "../contexts/PostContext";
import Home from "../pages/Home";
import CreatePostPage from "../pages/CreatePostPage";
import MyPosts from "../pages/MyPosts";
import PostDetails from "../pages/PostDetails";
import Watchlist from "../pages/Watchlist";
import AccountDetails from "../pages/AccountDetails";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <UserProvider>
      <PostProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={LoginAndRegister} />
              <Route path="/posts/:postId" component={PostDetails} />
              <ProtectedRoute path="/create-post" component={CreatePostPage} />
              <ProtectedRoute path="/my-posts" component={MyPosts} />
              <ProtectedRoute path="/watchlist" component={Watchlist} />
              <ProtectedRoute path="/account" component={AccountDetails} />
            </Switch>
          </div>
        </Router>
      </PostProvider>
    </UserProvider>
  );
}

export default App;