import React, { useEffect, useRef } from "react";
import JSONEditor, { EditableNode, JSONEditorOptions, MenuItem, MenuItemNode, Template } from "jsoneditor";
import "./JsonEditorContainer.scss";
import { addNode, removeNode } from '../../validator/Validator'

export function JsonEditorContainer(props: { json: any, templates: Template[] }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const jsonEditorInstance = useRef<JSONEditor | null>(null);

    const options: JSONEditorOptions = {
        mode: 'tree',
        templates: props.templates,
        onError: (err: any) => {
            console.log(err.toString())
        },
        onCreateMenu: (items: MenuItem[], node: MenuItemNode) => {
            const paths = node.paths[0];
            const isRemoveValid = removeNode(props.json, [...paths]);
            const validInsertItems = Object.values(Object(addNode([...paths]).resultNode?.data));
            const validMenuItems: MenuItem[] = [];


            // if removeNode validation returns error
            // Remove default Remove(Delete) function
            if (isRemoveValid.error) {
                items = items.filter(item => item.text !== "Remove")
            }

            // Creating a new MenuItem array that only contains valid items
            items.forEach(item => {
                if (item.text === "Insert") {
                    item.submenu?.forEach(subItem => {
                        validInsertItems.forEach((validItem: any) => {
                            if (validItem.description === subItem.title) {
                                validMenuItems.push(subItem);
                            }
                        });
                    })
                    item.submenu = validMenuItems;
                }
            });
            
            return items;
        },
        onEvent: (node: EditableNode, event: any) => {
            if (node.field !== undefined) {
                // console.log(event, node);
                if (event.type === "click") {
                    // console.log(event.type + ' event ' +
                    //     'on value ' + JSON.stringify(node.value) + ' ' +
                    //     'at path ' + JSON.stringify(node.path)
                    // )
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
            editor.set(props.json);
        }
    }, [props.json]);


    return (<div className="json-editor-container" ref={jsonEditorElm} />);
}
