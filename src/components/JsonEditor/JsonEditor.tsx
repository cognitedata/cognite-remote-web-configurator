import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { addNode, getAllNodes, loadSchema, removeNode } from '../../validator/Validator';
import { IValidationResult } from '../../validator/interfaces/IValidationResult';
import { Template } from 'jsoneditor';


export const JsonEditor: React.FC<any> = () => {
    const templates: Template[] = [];

    const initValidater = async () => {
        await loadSchema();
        // console.log('Remove----', removeNode(mauiA, [""]));
        // console.log('Add---', addNode([""]));
        // console.log('All Nodes---', getAllNodes());
        getAllNodes().map((node: any)=>{
            const temp = {
                text: node.key.split(":")[1],
                title: node.node.description,
                className: 'jsoneditor-type-object',
                field: node.key.split(":")[1],
                value: node.data
            }
            templates.push(temp);
        });
        console.log("temp", templates);
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
