import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { loadSchema, removeNode } from '../../validator/Validator';


export const JsonEditor: React.FC<any> = () => {

    const initValidater = async () => {
        loadSchema().then(() => {
            console.log('Result----', removeNode(mauiA, ["scenes"]));
        })
        // console.log('Result----', removeNode(mauiA, ["assets","geometries", "mauia", "modelId"]));

    }

    useEffect(() => {
        initValidater();
    }, []);

    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer json={mauiA} />
        </div>
    );
}
