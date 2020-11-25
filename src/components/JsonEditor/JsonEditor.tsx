import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { getAllNodes, loadSchema, addNode } from '../../validator/Validator';
import { Template } from 'jsoneditor';

const generateCaption = (key: string) => {
    let text = extractField(key);
    // add spaces
    text = text.replace(/([A-Z])/g, ' $1').trim();
    //capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text;
}

const extractField = (key: string) => {
    return key.split(":")[1]
}


export const JsonEditor: React.FC<any> = () => {
    const templates: Template[] = [];

    const initValidater = async () => {
        await loadSchema();
        // console.log('Remove----', removeNode(mauiA, [""]));
        console.log('Add---', addNode([]));
        // console.log('All Nodes---', getAllNodes());
        getAllNodes().map((node: any) => {
            const temp = {
                text: generateCaption(node.key),
                title: node.node.description,
                className: 'jsoneditor-type-object',
                field: extractField(node.key),
                value: node.data,
                key: node.key
            }
            templates.push(temp);
        });
    }

    useEffect(() => {
        initValidater();
    }, []);

    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer json={mauiA} templates={templates} />
        </div>
    );
}
