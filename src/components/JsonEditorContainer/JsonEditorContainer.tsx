import React, {useEffect, useRef} from "react";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";

export function JsonEditorContainer(props: { json: any }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const jsonEditorInstance = useRef<JSONEditor | null>(null);

    useEffect(() => {
        if (jsonEditorElm.current !== null) {
            // create the editor
            const container = jsonEditorElm.current;
            const options = {}
            jsonEditorInstance.current = new JSONEditor(container, options);
        }
    }, []);

    useEffect(()=> {
        const editor = jsonEditorInstance.current;
        if(editor) {
            editor.set(props.json);
        }
    }, [props.json]);


    return (<div className="json-editor-container" ref={jsonEditorElm} />);
}