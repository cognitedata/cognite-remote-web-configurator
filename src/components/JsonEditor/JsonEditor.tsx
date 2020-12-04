import React, { useEffect } from 'react';
import classes from './JsonEditor.module.scss'
import { JsonEditorContainer } from "../JsonEditorContainer/JsonEditorContainer";
import { getAllNodes, loadSchema } from '../../validator/Validator';
import { Template } from 'jsoneditor';
import { JsonConfig } from "../../types";
import data from '../../config/MauiA.json';

const extractField = (key: string) => {
    return key.split(":")[1]
}

export const JsonEditor: React.FC<{ jsonConfig: JsonConfig | null }> = (props: any) => {
    const templates: Template[] = [];

    const initValidater = async () => {
        await loadSchema();

        getAllNodes().forEach((node: any) => {
            const key = extractField(node.key)

            const temp = {
                text: key,
                title: node.node.description,
                className: 'jsoneditor-type-object',
                field: key,
                value: node.data
            }
            templates.push(temp);

            /**
             * if node type is array or map
             * adding sample data as a template
             */
            if (node.node.type === "array" || node.node.type === "map") {
                const temp = {
                    text: `${key}-sample`,
                    title: `Add sample item to ${key}`,
                    className: 'jsoneditor-type-object',
                    field: `${key}-sample`,
                    value: node.sample
                }
                templates.push(temp);
            }
        });
    }

    useEffect(() => {
        initValidater();
    }, []);

    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer json={data} templates={templates} />
        </div>
    );
}
