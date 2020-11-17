import React from 'react';
import classes from './TwinSelector.module.scss';
import { TwinItem } from '../Util/TwinItem/TwinItem';

const availableTwins: string[] = ['IA', 'MauiA', 'SkarvFPSOv4', 'demo'];

export const TwinSelector: React.FC<any> = () => {
    return (
        <>
            <h2>Unreal Digital Twin</h2>
            <div className={classes.button}> + Create New Twin</div>
            <p>Configure</p>
            <div className={classes.twinContainer}>
                {availableTwins.map(twin => {
                    return (
                        <TwinItem twinItem={twin}/>
                    )
                })}
            </div>
        </>
    );
}
