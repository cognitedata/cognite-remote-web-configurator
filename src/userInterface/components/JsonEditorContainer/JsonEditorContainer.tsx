import React, { useEffect, useRef } from "react";
import "./JsonEditorContainer.scss";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { JsonPayLoad } from "../../util/types";
import { IOpenApiSchema } from "../../../validator/interfaces/IOpenApiSchema";

export function JsonEditorContainer(props: { jsonEditorElm: any, onUpdateJson: (text: JsonPayLoad) => void , customSchema: IOpenApiSchema | null}): JSX.Element {

    const { jsonEditorElm, onUpdateJson, customSchema } = props;
    const updateCallBack = useRef(onUpdateJson);

    useEffect(() => {
        // onupdatejson function will be updated on each rerender of parent therefore we need to store it in a ref so
        // JsonEditor can call the correct function after instantiation
        updateCallBack.current = onUpdateJson;
    }, [onUpdateJson])


    useEffect(() => {
        const onChange = () => {
            const editor = JsonConfigCommandCenter.editor;
            if (editor) {
                updateCallBack.current(editor.get() as JsonPayLoad);
            }
        };

        (async () => {
            if (jsonEditorElm.current !== null) {

                const currentConfig = JsonConfigCommandCenter.currentJson;
                await JsonConfigCommandCenter.onLoadSchema(jsonEditorElm.current, onChange, customSchema);
                if(currentConfig) {
                    JsonConfigCommandCenter.setEditorText(currentConfig);
                }
            }
        })();
    }, [jsonEditorElm.current, customSchema]);

    return (<div className="json-editor-container"  ref={jsonEditorElm} />);
}
