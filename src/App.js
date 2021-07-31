import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MainContextProvider } from "./context";
import "./App.css";
import MainPage from "./pages/MainPage";

function App() {
    return (
        <MainContextProvider>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <MainPage />
                    </Route>
                </Switch>
            </Router>
        </MainContextProvider>
    );
}

export default App;
