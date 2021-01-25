import React, { useEffect } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { JsonPayLoad } from "../../util/types";

export function JsonEditorContainer(props: { jsonEditorElm: any, onUpdateJson: (text: JsonPayLoad) => void }): JSX.Element {

    const onChange = () => {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            props.onUpdateJson(editor.get() as JsonPayLoad);
        }
    };

    useEffect(() => {
        if (props.jsonEditorElm.current !== null) {
            JsonConfigCommandCenter.onLoadSchema(props.jsonEditorElm.current, onChange);
        }
    }, [props.jsonEditorElm.current]);

    return (<div className="json-editor-container"  ref={props.jsonEditorElm} />);
}
