import React, { useEffect } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";

export function JsonEditorContainer(props: { jsonEditorElm: any, json: any }): JSX.Element {

    useEffect(() => {
        if (props.jsonEditorElm.current !== null) {
            // create the editor
            JsonConfigCommandCenter.onLoadSchema(props.jsonEditorElm.current);
        }
    }, [props.jsonEditorElm.current]);

    useEffect(() => {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            editor.set(props.json);
            JsonConfigCommandCenter.updateTitle();
        }
    }, [props.json]);


    return (<div className="json-editor-container" ref={props.jsonEditorElm} />);
}
