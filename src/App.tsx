import React, { useState } from 'react';
import './App.scss';
import { JsonConfigurator } from './views/JsonConfigurator/JsonConfigurator';
import { Client } from "./cdf/client";
import { TenantLogin } from "./components/TwinSelector/TenantLogin/TenantLogin";

const cogniteClient = Client.sdk;

function App(): JSX.Element {
    const [signedIn, setSignIn] = useState(false);
    const onSignIn = (status: boolean) => {
        if(status) {
            setSignIn(true);
        }
    }

  return (
    <div className="App">
        <TenantLogin signedIn={signedIn} onLogin={onSignIn} sdk={cogniteClient}>
            <JsonConfigurator />
        </TenantLogin>
    </div>
  );
}

export default App;
