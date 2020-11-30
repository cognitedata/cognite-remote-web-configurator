import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { getAllNodes, loadSchema } from '../../validator/Validator';
import { Template } from 'jsoneditor';
import { JsonConfig } from "../../types";

const extractField = (key: string) => {
    return key.split(":")[1]
}

export const JsonEditor: React.FC<{ jsonConfig: JsonConfig | null}> = (props: any) => {
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
            <JsonEditorContainer json={props.jsonConfig?.data} templates={templates} />
        </div>
    );
}
