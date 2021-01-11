import React, { useState } from 'react';
import './App.scss';
import { JsonConfigurator } from './panels/JsonConfigurator/JsonConfigurator';
import { Client } from "../cdf/client";
import { TenantLogin } from "./components/TenantLogin/TenantLogin";
import { USE_LOCAL_FILES_AND_NO_LOGIN } from '../constants';

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
        {USE_LOCAL_FILES_AND_NO_LOGIN ? <JsonConfigurator /> :
        <TenantLogin signedIn={signedIn} onLogin={onSignIn} sdk={cogniteClient} authOptions={authOptions}>
            <JsonConfigurator />
        </TenantLogin>}
    </div>
  );
}

export default App;
