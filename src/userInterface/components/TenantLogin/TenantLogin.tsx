import React, {useEffect} from "react";
import { CogniteClient, isLoginPopupWindow, loginPopupHandler, POPUP } from "@cognite/sdk";
import { ClientSDKProvider, PureObject, TenantSelector } from "@cognite/gearbox";
import styles from "./TenantLogin.module.scss";
import {APP_NAME, DEV_MODE, LOGIN_CDF_ENVIRONMENT_OPT_TEXT, LOGIN_HEADER} from "../../../constants";
import {Client} from "../../../cdf/client";

export function TenantLogin(props: {
    children: any
    sdk: CogniteClient,
    signedIn: boolean,
    onLogin: (...status: any) => void,
    authOptions: { project?: string, apiKey?: string, oauthToken?: string }
}): JSX.Element | null {

    const advancedOptions = { cdfEnvironment: ''};

    useEffect(() => {
        if (DEV_MODE) {
            Client.sdk.loginWithOAuth({
                project: process.env.REACT_APP_PROJECT || '',
                accessToken: localStorage.getItem('token') || '',
                onAuthenticate: (login: any) => {
                    login.skip();
                },
                onTokens: ({accessToken}) => {
                    localStorage.setItem("token", accessToken);
                },
            });
            Client.sdk.authenticate();
            props.onLogin(true);
        }
    }, []);

    if (isLoginPopupWindow()) {
        loginPopupHandler();
        return null;
    }

    const oninvalidTenant = (value: any) => {
        console.error("Tenant Error", value);
    };

    const onFinish = async (project: string, options: PureObject | null) => {
        if(project){
            const cdfEnv = options && options[LOGIN_CDF_ENVIRONMENT_OPT_TEXT];
            if(cdfEnv) {
                props.sdk.setBaseUrl(`https://${cdfEnv}.cognitedata.com`);
            }
            const token = localStorage.getItem("token") || "";
            props.sdk.loginWithOAuth({
                project: project,
                accessToken: token,
                onAuthenticate: POPUP,
                onTokens: ({accessToken}) => {
                    localStorage.setItem("token", accessToken);
                },
            });
            await props.sdk.authenticate();

            const status = await props.sdk.login.status();
            if(status?.user){
                props.onLogin(true);
            }
        }
        console.log('Success:', project);
        return true;
    };

    if (props.signedIn) {
        return <>{props.children}</>;
    } else {
        // return <CustomLogin sdk={props.sdk} onLogin={props.onLogin} />;
        return (
            <div className={styles.loginContainer}>
                <ClientSDKProvider client={props.sdk}>
                    <TenantSelector
                        title={APP_NAME}
                        header={LOGIN_HEADER}
                        onTenantSelected={onFinish}
                        advancedOptions={advancedOptions}
                        onInvalidTenant={oninvalidTenant}/>
                </ClientSDKProvider>
            </div>);
    }
}
