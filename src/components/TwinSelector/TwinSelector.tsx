import React from 'react';
import classes from './TwinSelector.module.scss';
import { CommandItem } from '../Util/CommandItem/CommandItem'
import { Client } from "../../cdf/client";
import { TwinItemContainer } from "../Util/TwinItemContainer/TwinItemContainer";
import { Divider } from "antd";
import logo from "../../assets/cognite.png";
import Text from "antd/es/typography/Text";

const cogniteClient = Client.sdk;

export const TwinSelector: React.FC<{onTwinSelect: (twin: any) => void}> = (props: any ) => {
    return (
        <>
            <div className={classes.top}>
                <div>
                    <img src={logo} className={classes.logo}/>
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div className={classes.createNewBtn}>
                <CommandItem icon={"plus"}>Create New</CommandItem>
            </div>
            <Divider />
            <div>
                <Text>Configurations</Text>
                <div className={classes.twinContainer}>
                    <TwinItemContainer sdk={cogniteClient} onClick={props.onTwinSelect}/>
                </div>
            </div>
        </>
    );
}
