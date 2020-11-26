import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { addNode, getAllNodes, loadSchema, removeNode } from '../../validator/Validator';


export const JsonEditor: React.FC<any> = () => {

    const initValidater = async () => {
        await loadSchema();
        console.log('Remove----', removeNode(mauiA, []));
        console.log('Add---', addNode(['workOrders']));
        console.log('All Nodes---', getAllNodes());
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
