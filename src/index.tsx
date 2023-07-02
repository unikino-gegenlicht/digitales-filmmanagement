import React from 'react';
import ReactDOM from 'react-dom/client';
import BaseApp from "./App";
import reportWebVitals from './reportWebVitals';
import {AuthProvider} from "react-oidc-context";
import {User} from "oidc-client-ts";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/login/login";
import {LoginCallback} from "./pages/login/callback";
import Register from "./pages/register/register";
import SettingsPage from "./pages/settings/settings";
import axios from "axios";
import Navigation from "./components/navbar/navbar";

let oidcAuthority = process.env.REACT_APP_OIDC_AUTHORITY
let oidcClientId = process.env.REACT_APP_OIDC_CLIENT_ID


if (!oidcClientId) {
    throw new Error("no client id provided")
}

if (!oidcAuthority) {
    throw new Error("no authority provided")
}

const oidcConfig = {
    authority: oidcAuthority,
    client_id: oidcClientId,
    redirect_uri: window.location.protocol + "//" + window.location.host + "/callback",
    scope: "openid profile email",
    onSigninCallback: (user: User | void) => {
        console.log(user)
        console.log(window.location)
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.replace("/")
    },


}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
axios.interceptors.request.use(
    request => {
        let localStorageKey = "oidc.user:" + oidcAuthority + ":" + oidcClientId
        const oidcStorage = sessionStorage.getItem(localStorageKey)
        if (!oidcStorage) {
            console.log("no user avaiable. sending unauthenticated request")
            return request;
        }

        let user = User.fromStorageString(oidcStorage);
        let token = user?.access_token
        request.headers["Authorization"] = "Bearer " + token
        return request;
    },
    error => {
        return Promise.reject(error);
    }
)

root.render(
    <AuthProvider {...oidcConfig}>

        <Router>
            <Navigation/>
                <Routes>
                    <Route path={"/"} element={<BaseApp/>}/>
                    <Route path={"/register"} element={<Register/>}/>
                    <Route path={"/callback"} element={<LoginCallback/>}/>
                    <Route path={"/login"} element={<LoginPage/>}/>
                    <Route path={"/settings"} element={<SettingsPage/>}/>
                </Routes>
        </Router>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
