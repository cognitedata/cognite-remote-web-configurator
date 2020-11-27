import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import mauiA from '../../config/MauiA.json';
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { getAllNodes, loadSchema } from '../../validator/Validator';
import { Template } from 'jsoneditor';

const extractField = (key: string) => {
    return key.split(":")[1]
}

export const JsonEditor: React.FC<any> = () => {
    const templates: Template[] = [];

    const initValidater = async () => {
        await loadSchema();
        getAllNodes().map((node: any) => {
            const temp = {
                text: extractField(node.key),
                title: node.node.description,
                className: 'jsoneditor-type-object',
                field: extractField(node.key),
                value: node.data
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
