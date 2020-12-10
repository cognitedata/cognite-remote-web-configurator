import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import { CommandItem } from '../../components/CommandItem/CommandItem'
import { ConfigSelector } from '../../components/ConfigSelector/ConfigSelector';
import Divider from "antd/es/divider";
import Text from "antd/es/typography/Text";

export const SideNavPanel: React.FC<{ onTwinSelect: (configName: string) => void, digitalTwinNames: string[], selectedTwinName: string | null }> = (props: any) => {
    return (
        <>
            <div className={classes.top}>
                <div>
                    <img src={logo} className={classes.logo} />
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div className={classes.createNewBtn} onClick={() => props.onTwinSelect()}>
                <CommandItem icon={"plus"}>Create New</CommandItem>
            </div>
            <Divider />
            <div>
                <Text>Configurations</Text>
                <div className={classes.twinContainer}>
                    <ConfigSelector onClick={props.onTwinSelect} digitalTwinNames={props.digitalTwinNames} selectedTwinName={props.selectedTwinName} />
                </div>
            </div>
        </>
    );
}
