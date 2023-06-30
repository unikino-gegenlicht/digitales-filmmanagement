// FIXME: replace later with actual application code or remove file
import React, {Component} from 'react';
import './App.scss';
import {Button} from "react-bulma-components";
import {AuthContextProps, withAuth} from "react-oidc-context";

class BaseApp extends Component<any, any> {
    render() {
        // access the auth properties
        let auth: AuthContextProps = this.props?.auth
        console.log(auth)
        // now check if the authentication is loading and suspend the page while it loads
        if (auth.isLoading) {
            return (<div></div>);
        }
        // now check if the user is authenticated
        if (auth.isAuthenticated) {
            return (
                <div className={"content"}>
                    <h2 className={"title is-size-1 has-text-centered has-text-primary"}>Digitales Filmmanagement</h2>
                    <div className={"box m-3"}>
                        <p>Hier entsteht aktuell das digitale Filmmanagement des Unikinos GEGENLICHT</p>
                        <p className={"has-text-info has-text-centered is-size-5"}>
                            Diese Seite wird gelöscht, sobald das Projekt seinen &alpha;-Status erreicht hat.
                        </p>
                        <Button color={"primary"}>Klick me!</Button>
                    </div>
                </div>
            );
        } else {
        }

    }
}

export default withAuth(BaseApp);