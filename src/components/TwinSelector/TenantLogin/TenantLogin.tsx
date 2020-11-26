import React from "react";
import { CogniteClient, isLoginPopupWindow, loginPopupHandler, POPUP } from "@cognite/sdk";
import { Button, Card, Form, Input } from "antd";
import styles from "./TenantLogin.module.scss";

export function TenantLogin(props: {
    children: any
    sdk: CogniteClient,
    signedIn: boolean,
    onLogin: (status: boolean)=>void
}): JSX.Element | null {

    if (isLoginPopupWindow()) {
        loginPopupHandler();
        return null;
    }

    const onFinish = async (values: any) => {
        if(values){
            const project = values['tenantName'];
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
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    if(props.signedIn) {
        return <>{props.children}</>;
    }
    else {
        return (
            <div className={styles.loginContainer}>
                <Card title="Sign in To Tenant" style={{ width: 300 }}>
                    <Form
                        layout="vertical"
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item label="Tenant Name" name="tenantName" required tooltip="Input tenant name"
                                   rules={[{ required: true, message: 'Please input your tenant name!' }]}>
                            <Input placeholder="input placeholder" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        );
    }
}
