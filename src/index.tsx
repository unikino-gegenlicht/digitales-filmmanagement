import React from 'react';
import ReactDOM from 'react-dom/client';
import BaseApp from "./App";
import reportWebVitals from './reportWebVitals';
import {AuthProvider} from "react-oidc-context";
import {User} from "oidc-client-ts";
import env from "./env"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/login/login";
import {LoginCallback} from "./pages/login/callback";
import CashRegister from "./pages/cashRegister/cashRegister";
import {RegisterItem} from "./pages/cashRegister/types";

const oidcConfig = {
    authority: env.OIDC_AUTHORITY,
    client_id: env.OIDC_CLIENT_ID,
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

let registerItems: RegisterItem[] = [
    {
        name: "Eintritt",
        icon: "🎟️",
        price: 3.00,
        buttonColor: "success"
    },
    {
        name: "Double Feature",
        icon: "🎟️",
        price: 5.00,
        buttonColor: "success"
    },
    {
        name: "Popcorn",
        icon: "🍿",
        price: 1.00,
        buttonColor: "warning"
    },
    {
        name: "Getränk",
        icon: "🍾",
        price: 1.00,
        buttonColor: "warning"
    }
]

root.render(
    <AuthProvider {...oidcConfig}>
        <Router>
            <Routes>
                <Route path={"/"} element={<BaseApp />}/>
                <Route path={"/cashRegister"} element={<CashRegister items={registerItems} />}/>
                <Route path={"/callback"} element={<LoginCallback />}/>
                <Route path={"/login"} element={<LoginPage />}/>
            </Routes>
        </Router>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
