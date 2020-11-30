import React from 'react';
import classes from './TwinSelector.module.scss';
import { CommandItem } from '../Util/CommandItem/CommandItem'
import { Client } from "../../cdf/client";
import { TwinItemContainer } from "../Util/TwinItemContainer/TwinItemContainer";
import Title from "antd/es/typography/Title";
import { Divider } from "antd";

const cogniteClient = Client.sdk;

export const TwinSelector: React.FC<{onTwinSelect: (twin: any) => void}> = (props: any ) => {
    return (
        <>
            <div className={classes.top}>
                <Title level={3} className={classes.title}>Unreal Digital Twin</Title>
            </div>
            <Divider />
            <div>
                <CommandItem><i className="fa fa-plus"></i> Create New Twin</CommandItem>
            </div>
            <Divider />
            <div>
                <Title level={5}>Configurations</Title>
                <div className={classes.twinContainer}>
                    <TwinItemContainer sdk={cogniteClient} onClick={props.onTwinSelect}/>
                </div>
            </div>
        </>
    );
}
