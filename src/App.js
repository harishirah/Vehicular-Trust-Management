import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MainContextProvider } from "./context";
import "./App.css";
import MainPage from "./pages/MainPage";
import TestPage from "./pages/TestPage";

function App() {
    return (
        <MainContextProvider>
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
        </MainContextProvider>
    );
}

export default App;
