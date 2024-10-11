// src/components/App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./NavBar";
import LoginAndRegister from "../pages/LoginAndRegister";
import { UserProvider } from "../contexts/UserContext";
import Home from "../pages/Home";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={LoginAndRegister} />
          </Switch>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;