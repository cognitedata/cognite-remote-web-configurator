import React, { useEffect, useRef } from "react";
import JSONEditor, { EditableNode, JSONEditorOptions, MenuItem, MenuItemNode, Template } from "jsoneditor";
import "./JsonEditorContainer.scss";
import { addNode, removeNode } from '../../validator/Validator';
import { ErrorType } from "../../validator/interfaces/IValidationResult";

const createValidInsertMenu = (submenu: MenuItem[] | undefined, validInsertItems: any, existingKeys: (number | string)[]) => {
    const validMenuItems: MenuItem[] = [];

    if (submenu === undefined || submenu.length === 0) {
        return undefined;
    }

    submenu?.forEach(subItem => {
        if (validInsertItems !== undefined && validInsertItems.length !== 0) {
            let matchingItemCountWithSameDesc = 0;

            Object.keys(validInsertItems).forEach((key: any) => {
                if (!existingKeys.includes(key) &&
                    subItem.text === key &&
                    subItem.title === validInsertItems[key].description) {
                    validMenuItems.push(subItem);
                    matchingItemCountWithSameDesc++;
                }
            });

            if (matchingItemCountWithSameDesc > 1) {
                alert("non-unique Menu Items, Please use the valid option");
            }
        }
    });

    return validMenuItems;
}

const getExistingKeys = (json: any, path: (number | string)[]) => {
    let subTree = json;
    path.forEach((step: number | string) => {
        subTree = subTree[step];
    });
    return Object.keys(subTree).map((key: number | string) => {
        return key;
    });
}

export function JsonEditorContainer(props: { json: any, templates: Template[] }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const jsonEditorInstance = useRef<JSONEditor | null>(null);

    const options: JSONEditorOptions = {
        mode: 'tree',
        templates: props.templates,
        onError: (err: any) => {
            console.log(err.toString())
        },
        onCreateMenu: (menuItems: MenuItem[], node: MenuItemNode) => {
            // get current state
            const currentJsonText = jsonEditorInstance.current?.getText();
            let currentJson;
            if (currentJsonText) {
                currentJson = JSON.parse(currentJsonText);
            }

            const path = node.path;
            // get parant Path for add function
            const parentPath: string[] = [...path];
            //Skip case: adding first child
            if (node.type !== "append") {
                parentPath.pop();
            }

            const removePossibility = removeNode(currentJson, [...path]);
            const validInsertItems = Object(addNode([...parentPath]).resultNode?.data);
            const existingKeys: (number | string)[] = getExistingKeys(currentJson, [...parentPath]);

            // if removeNode validation returns error
            // Remove default Remove(Delete) function and alert the error
            if (removePossibility.error) {
                menuItems.forEach(item => {
                    if (item.text === "Remove") {
                        item.className = "warning-triangle";
                        item.click = () => {
                            switch (removePossibility.error?.type) {
                                case ErrorType.InvalidPath:
                                    alert("Error: Canot Remove. The request contains an invalid path");
                                    break;
                                // RequiredNode
                                case ErrorType.RequiredNode:
                                    alert("Error: Canot Remove. This field is mandatory");
                                    break;
                                // MinLength
                                case ErrorType.MinLength:
                                    alert("Error: Canot Remove. Array has a minimum length");
                                    break;
                                default:
                                    alert("Error: Canot Remove.");
                                    break;
                            }
                        };
                    }
                });
            }

            // Creating a new MenuItem array that only contains valid items
            // and replace submenu with valid items
            menuItems.forEach(item => {
                if (item.text === "Insert") {
                    item.text = "Prepend Item";
                    item.submenu = createValidInsertMenu(item.submenu, validInsertItems, existingKeys);
                }
                // adding samw logic to Append
                if (item.text === "Append") {
                    item.text = "Append Item";
                    item.submenu = createValidInsertMenu(item.submenu, validInsertItems, existingKeys);
                }
            });

            return menuItems;
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
