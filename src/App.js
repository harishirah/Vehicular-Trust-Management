import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MainContextProvider } from "./context";
import "./App.css";
import MainPage from "./pages/MainPage";
import VHome from "./pages/VHome";
import VChat from "./pages/VChat";
import ProtectedRoute from "./utils/ProtectedRoute";
import { SocketProvider } from "./context/SocketProvider";
import AdminPage from "./pages/AdminPage";

function App() {
    return (
        <MainContextProvider>
            <SocketProvider>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <AdminPage />
                        </Route>
                        <Route exact path="/vehicle">
                            <VHome />
                        </Route>
                        <Route exact path="/main" component={MainPage} />
                        <ProtectedRoute
                            exact
                            path="/chat/:room/:username"
                            component={VChat}
                        />
                    </Switch>
                </Router>
            </SocketProvider>
        </MainContextProvider>
    );
}

export default App;
