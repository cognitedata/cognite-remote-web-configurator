import React from 'react';
import classes from './TwinSelector.module.scss';
import { CommandItem } from '../Util/CommandItem/CommandItem'
import { Client } from "../../cdf/client";
import { TwinItemContainer } from "../Util/TwinItemContainer/TwinItemContainer";

const cogniteClient = Client.sdk;

export const TwinSelector: React.FC<any> = () => {
    return (
        <>
            <h2>Unreal Digital Twin</h2>
            <CommandItem><i className="fa fa-plus"></i> Create New Twin</CommandItem>
            <br />
            <p>Configure</p>
            <div className={classes.twinContainer}>
                <TwinItemContainer sdk={cogniteClient}/>
            </div>
        </>
    );
}
