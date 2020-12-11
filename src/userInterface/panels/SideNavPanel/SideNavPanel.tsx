import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import { CommandItem } from '../../components/CommandItem/CommandItem'
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
                    <img src={logo} className={classes.logo} />
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div className={classes.createNewBtn} onClick={() => props.onJsonConfigSelect()}>
                <CommandItem icon={"plus"}>Create New</CommandItem>
            </div>
            <Divider />
            <div>
                <Text>Configurations</Text>
                <div className={classes.jsonConfigContainer}>
                    <ConfigSelector onJsonConfigSelect={props.onJsonConfigSelect} jsonConfigMap={props.jsonConfigMap} selectedJsonConfigId={props.selectedJsonConfigId} />
                </div>
            </div>
        </>
    );
}
