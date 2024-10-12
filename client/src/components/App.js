import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./NavBar";
import LoginAndRegister from "../pages/LoginAndRegister";
import { UserProvider } from "../contexts/UserContext";
import Home from "../pages/Home";
import CreatePost from "./CreatePost";
import MyPosts from "../pages/MyPosts";
import PostDetails from "../pages/PostDetails";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={LoginAndRegister} />
            <Route path="/create-post" component={CreatePost} />
            <Route path="/my-posts" component={MyPosts} />
            <Route path="/posts/:postId" component={PostDetails} />
          </Switch>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;