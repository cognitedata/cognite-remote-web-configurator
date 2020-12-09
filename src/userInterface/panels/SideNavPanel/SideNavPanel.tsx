import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import { Client } from "../../../cdf/client";
import { CommandItem } from '../../components/CommandItem/CommandItem'
import { ConfigSelector } from '../../components/ConfigSelector/ConfigSelector';
import Divider from "antd/es/divider";
import Text from "antd/es/typography/Text";
import { JsonConfig } from '../../util/types';

const cogniteClient = Client.sdk;

export const SideNavPanel: React.FC<{ onTwinSelect: (configName?: string, config?: JsonConfig) => void, selectedTwin: string }> = (props: any) => {
    return (
        <>
            <div className={classes.top}>
                <div>
                    <img src={logo} className={classes.logo} />
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div className={classes.createNewBtn} onClick={props.onTwinSelect}>
                <CommandItem icon={"plus"}>Create New</CommandItem>
            </div>
            <Divider />
            <div>
                <Text>Configurations</Text>
                <div className={classes.twinContainer}>
                    <ConfigSelector sdk={cogniteClient} onClick={props.onTwinSelect} selectedTwin={props.selectedTwin} />
                </div>
            </div>
        </>
    );
}
