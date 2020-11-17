import React from 'react';
import classes from './JsonEditor.module.scss'
import ReactJson from 'react-json-view';
import mauiA from '../../config/MauiA.json';


export const JsonEditor: React.FC<any> = () => {
    return (
        <div className={classes.jsonView}>
            <ReactJson src={mauiA} />
        </div>
    );
}
