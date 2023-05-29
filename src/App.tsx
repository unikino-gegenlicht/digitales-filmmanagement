// FIXME: replace later with actual application code or remove file
import React from 'react';
import logo from './logo.svg';
import './App.scss';
import {TextColor} from "./bulma/Colors";

function BaseApp() {
    return (
        <div className={"content"}>
            <h2 className={"title is-size-1 has-text-centered has-text-primary"}>Digitales Filmmanagement</h2>
            <div className={"box m-3"}>
                <p>Hier entsteht aktuell das digitale Filmmanagement des Unikinos GEGENLICHT</p>
                <p className={TextColor.Info + " has-text-centered is-size-5"}>
                    Diese Seite wird gelöscht, sobald das Projekt seinen &alpha;-Status erreicht hat.
                </p>
            </div>
        </div>

    );
}

export default BaseApp;