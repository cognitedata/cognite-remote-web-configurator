import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import { ConfigSelector } from '../../components/ConfigSelector/ConfigSelector';
import Divider from "antd/es/divider";
import Text from "antd/es/typography/Text";

export const SideNavPanel: React.FC<{
    onJsonConfigSelect: (jsonConfigId: number) => void,
    jsonConfigMap: Map<number, unknown> | null,
    selectedJsonConfigId: number | null
}> = (props: any) => {
    return (
        <>
            <div className={classes.top}>
                <div>
                    <img alt="cognite-logo" src={logo} className={classes.logo} />
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div>
                <Text strong>Configurations</Text>
                <div className={classes.jsonConfigContainer}>
                    <ConfigSelector onJsonConfigSelect={props.onJsonConfigSelect} jsonConfigMap={props.jsonConfigMap} selectedJsonConfigId={props.selectedJsonConfigId} />
                </div>
            </div>
        </>
    );
}
