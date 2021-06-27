import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import "./App.css";
import MainPage from "./pages/MainPage";
import TestPage from "./pages/TestPage";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <MainPage />
        </Route>
        <Route exact path="/test">
          <TestPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
