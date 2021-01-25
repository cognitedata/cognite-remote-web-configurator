import React, { useEffect, useRef } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { JsonPayLoad } from "../../util/types";

export function JsonEditorContainer(props: { onUpdateJson: (text: JsonPayLoad) => void }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const onChange = () => {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            props.onUpdateJson(editor.get() as JsonPayLoad);
        }
    };

    useEffect(() => {
        if (jsonEditorElm.current !== null) {
            // create the editor
            JsonConfigCommandCenter.createEditor(jsonEditorElm.current, onChange);
        }
    }, []);

    return (<div className="json-editor-container" ref={jsonEditorElm} />);
}
