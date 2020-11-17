import React from 'react';
import classes from './TwinSelector.module.scss';

const availableTwins: string[] = ['IA', 'MauiA', 'SkarvFPSOv4', 'demo'];

const TwinItem: React.FC<string> = (twinName: string) => {
    return <div className={classes.twinItem}>{twinName}</div>
}

export const TwinSelector: React.FC<any> = () => {
    return (
        <>
            <h2>Unreal Digital Twin</h2>
            <div className={classes.button}> + Create New Twin</div>
            <p>Configure</p>
            <div className={classes.twinContainer}>
                {availableTwins.map(twin => {
                    return (
                        TwinItem(twin)
                    )
                })}
            </div>
        </>
    );
}
