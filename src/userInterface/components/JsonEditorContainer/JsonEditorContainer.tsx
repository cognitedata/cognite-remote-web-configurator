import React, { useEffect } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { JsonPayLoad } from "../../util/types";
import { IOpenApiSchema } from "../../../validator/interfaces/IOpenApiSchema";

export function JsonEditorContainer(props: { jsonEditorElm: any, onUpdateJson: (text: JsonPayLoad) => void , customSchema: IOpenApiSchema | null}): JSX.Element {

    const onChange = () => {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            props.onUpdateJson(editor.get() as JsonPayLoad);
        }
    };

    useEffect(() => {
        (async () => {
            if (props.jsonEditorElm.current !== null) {

                const currentConfig = JsonConfigCommandCenter.currentJson;
                await JsonConfigCommandCenter.onLoadSchema(props.jsonEditorElm.current, onChange, props.customSchema);
                if(currentConfig) {
                    JsonConfigCommandCenter.setEditorText(currentConfig);
                }
            }
        })();
    }, [props.jsonEditorElm.current, props.customSchema]);

    return (<div className="json-editor-container"  ref={props.jsonEditorElm} />);
}
