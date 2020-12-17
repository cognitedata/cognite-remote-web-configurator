import React, { useEffect, useRef } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";

export function JsonEditorContainer(props: { json: any }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (jsonEditorElm.current !== null) {
            // create the editor
            JsonConfigCommandCenter.createEditor(jsonEditorElm.current);
        }
    }, []);

    useEffect(() => {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            editor.set(props.json);
            JsonConfigCommandCenter.updateTitle();
        }
    }, [props.json]);


    return (<div className="json-editor-container" ref={jsonEditorElm} />);
}
