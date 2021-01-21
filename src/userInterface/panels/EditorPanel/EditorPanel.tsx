import React from 'react';
import classes from './EditorPanel.module.scss'
import { JsonEditorContainer } from "../../components/JsonEditorContainer/JsonEditorContainer";
import { JsonConfig } from "../../util/types";

interface Props { 
    jsonEditorElm: any;
    jsonConfig: JsonConfig | null 
}
export const EditorPanel: React.FC<Props> = ({jsonEditorElm, jsonConfig}) => {
    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer jsonEditorElm={jsonEditorElm} json={jsonConfig?.data} />
        </div>
    );
}
