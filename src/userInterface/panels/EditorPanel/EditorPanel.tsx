import React from 'react';
import classes from './EditorPanel.module.scss'
import { JsonEditorContainer } from "../../components/JsonEditorContainer/JsonEditorContainer";
import { JsonConfig } from "../../util/types";

export const EditorPanel: React.FC<{ jsonEditorElm: any, jsonConfig: JsonConfig | null }> = (props: any) => {

    return (
        <div className={classes.jsonView}>
            <JsonEditorContainer jsonEditorElm={props.jsonEditorElm} json={props.jsonConfig?.data} />
        </div>
    );
}
