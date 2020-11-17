import React from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import {JsonEditorContainer} from "../JsonEditorContainer/JsonEditorContainer";


export const JsonEditor: React.FC<any> = () => {
    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer json={mauiA} />
        </div>
    );
}
