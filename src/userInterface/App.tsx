import React, { useState } from 'react';
import './App.scss';
import { JsonConfigurator } from './panels/JsonConfigurator/JsonConfigurator';
import { Client } from "../cdf/client";
import { TenantLogin } from "./components/TenantLogin/TenantLogin";

const cogniteClient = Client.sdk;

function App(props: { auth?: { project?: string, apiKey?: string, oauthToken?: string}}): JSX.Element {
    const authOptions = props.auth || {};
    const [signedIn, setSignIn] = useState(false);
    const onSignIn = (status: boolean) => {
        if(status) {
            setSignIn(true);
        }
    }

  return (
    <div className="App">
        <TenantLogin signedIn={signedIn} onLogin={onSignIn} sdk={cogniteClient} authOptions={authOptions}>
            <JsonConfigurator />
        </TenantLogin>
    </div>
  );
}

export default App;
