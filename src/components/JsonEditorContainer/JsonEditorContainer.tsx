import React, { useEffect, useRef, useState } from "react";
import JSONEditor, { EditableNode, JSONEditorOptions, MenuItem, MenuItemNode } from "jsoneditor";
import "./JsonEditorContainer.scss";
import { removeNode } from '../../validator/Validator'

export function JsonEditorContainer(props: { json: any }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const jsonEditorInstance = useRef<JSONEditor | null>(null);
    const [JsonFile, setJsonFile] = useState(props.json);

    const options: JSONEditorOptions = {
        mode: 'tree',
        templates: [
            {
                text: 'Person',
                title: 'Insert a Person Node',
                className: 'jsoneditor-type-object',
                field: 'PersonTemplate',
                value: {
                    'firstName': 'John',
                    'lastName': 'Do',
                    'age': 28
                }
            },
            {
                text: 'Address',
                title: 'Insert a Address Node',
                field: 'AddressTemplate',
                value: {
                    'street': '',
                    'city': '',
                    'state': '',
                    'ZIP code': ''
                }
            }
        ],
        onError: (err: any) => {
            console.log(err.toString())
        },
        onCreateMenu: (items: MenuItem[], node: MenuItemNode) => {
            const paths = node.paths[0]
            const removeResult = removeNode(props.json, paths)

            //new Delete function
            const Delete = () => {
                if (!removeResult.error) {
                    console.log("new", removeResult.resultData)
                    setJsonFile(removeResult.resultData);
                }
            }

            // if removeNode validation returns error
            // Remove default Remove(Delete) function
            if (removeResult.error) {
                items = items.filter(item => item.text !== "Remove")
            }

            // alter existing Remove method
            items.forEach((item) => {
                if (item.text === "Remove") {
                    item.click = Delete;
                }
            });

            return items;
        },
        onEvent: (node: EditableNode, event: any) => {
            if (node.field !== undefined) {
                console.log(event, node);
                if (event.type === "click") {
                    console.log(event.type + ' event ' +
                        'on value ' + JSON.stringify(node.value) + ' ' +
                        'at path ' + JSON.stringify(node.path)
                    )
                }
            }
        },
        onChange: function (...params) {
            console.log('change', params);
        },
        onModeChange: (mode: any) => {
            const domElement = jsonEditorElm.current;
            if (domElement) {
                const treeMode: HTMLElement | null = domElement.querySelector('#treeModeSelection')
                const textMode: HTMLElement | null = domElement.querySelector('#textModeSelection')

                if (textMode && treeMode) {
                    treeMode.style.display = textMode.style.display = 'none'

                    if (mode === 'code' || mode === 'text') {
                        textMode.style.display = 'inline'
                    } else {
                        treeMode.style.display = 'inline'
                    }
                }
            }
        },
        indentation: 4,
        escapeUnicode: true,
        onTextSelectionChange: (start: any, end: any, text: string) => {
            const domElement = jsonEditorElm.current;
            if (domElement) {
                const rangeEl = domElement.querySelector('#textRange');
                const textEl = domElement.querySelector('#selectedText');
                if (rangeEl) {
                    rangeEl.innerHTML = 'start: ' + JSON.stringify(start) + ', end: ' + JSON.stringify(end);
                }
                if (textEl) {
                    textEl.innerHTML = text;
                }
            }
        },
        onSelectionChange: function (start: any, end: any) {
            const domElement = jsonEditorElm.current;
            if (domElement) {
                const nodesEl = domElement.querySelector('#selectedNodes');
                if (nodesEl) {
                    nodesEl.innerHTML = '';
                    if (start) {
                        nodesEl.innerHTML = ('start: ' + JSON.stringify(start));
                        if (end) {
                            nodesEl.innerHTML += ('<br/>end: ' + JSON.stringify(end));
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (jsonEditorElm.current !== null) {
            // create the editor
            const container = jsonEditorElm.current;
            jsonEditorInstance.current = new JSONEditor(container, options);
        }
    }, []);

    useEffect(() => {
        const editor = jsonEditorInstance.current;
        if (editor) {
            editor.set(JsonFile);
        }
    }, [JsonFile]);


    return (<div className="json-editor-container" ref={jsonEditorElm} />);
}
