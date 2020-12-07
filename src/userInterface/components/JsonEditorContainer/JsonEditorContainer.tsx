import React, { useEffect, useRef } from "react";
import JSONEditor, { JSONEditorOptions, JSONPath, MenuItem, MenuItemNode, Template } from "jsoneditor";
import "./JsonEditorContainer.scss";
import { addNode, removeNode } from '../../../validator/Validator';
import { ErrorType } from "../../../validator/interfaces/IValidationResult";
import { StringNode } from "../../../validator/nodes/StringNode";
import { ArrayNode } from "../../../validator/nodes/ArrayNode";
import { IData } from "../../../validator/nodes/BaseNode";
import { AdditionalNode } from "../../../validator/nodes/AdditionalNode";
import { JsonConfigCommandCenter } from "../../util/JsonConfigCommandCenter";

const createValidInsertMenu = (submenu: MenuItem[] | undefined, currentJson: any, parentPath: (string | number)[]) => {
    const validMenuItems: MenuItem[] = [];
    const validInsertItems: any = getValidInsertItems(parentPath);
    const existingKeys: (number | string)[] = getExistingKeys(currentJson, [...parentPath]);
    const resultNode = addNode([...parentPath]).resultNode;

    if (submenu === undefined || submenu.length === 0) {
        return undefined;
    }

    submenu?.forEach(subItem => {
        if (validInsertItems !== undefined && validInsertItems.length !== 0) {
            let matchingItemCountWithSameDesc = 0;

            Object.keys(validInsertItems).forEach((key: any) => {
                if (subItem.text === key &&
                    subItem.title === validInsertItems[key].description) {
                    /**
                     * filter alredy added items from insert menu
                     * unless it's map
                     */
                    if (!(resultNode instanceof AdditionalNode) && !existingKeys.includes(key)) {
                        validMenuItems.push(subItem);
                    }
                    if(resultNode instanceof AdditionalNode) {
                        validMenuItems.push(subItem);
                    }
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

const getValidInsertItems = (parentPath: (string | number)[]): IData => {
    const key = parentPath[parentPath.length - 1]
    const resultNode = addNode([...parentPath]).resultNode;
    /**
     * When adding items to an Array or a Map,
     * returning a IData object with matching key and description
     */
    if (resultNode instanceof ArrayNode || resultNode instanceof AdditionalNode) {
        return {
            [`${key}-sample`]: {
                data: undefined,
                description: `Add sample item to ${key}`
            }
        }
    }
    else {
        return resultNode?.data;
    }
}

export function JsonEditorContainer(props: { json: any, templates: Template[] }): JSX.Element {
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const jsonEditorInstance = useRef<JSONEditor | null>(null);

    const options: JSONEditorOptions = {
        mode: 'tree',
        templates: props.templates,

        // remove unwanted items from top Command Bar
        enableSort: false,
        enableTransform: false,

        indentation: 4,
        escapeUnicode: true,

        onCreateMenu: (menuItems: MenuItem[], node: MenuItemNode) => {
            // get current state
            const currentJsonText = jsonEditorInstance.current?.getText();
            let currentJson: any;
            if (currentJsonText) {
                currentJson = JSON.parse(currentJsonText);
            }

            const path = node.path;
            // get parant Path for add function
            const parentPath: string[] = [...path];
            // Skip case: adding first child
            if (node.type !== "append") {
                parentPath.pop();
            }

            const removePossibility = removeNode(currentJson, [...path]);

            // Creating a new MenuItem array that only contains valid items
            // and replace submenu with valid items
            menuItems.forEach(item => {
                if (item.text === "Insert") {
                    item.click = undefined;
                    item.submenu = createValidInsertMenu(item.submenu, currentJson, parentPath);
                }
                // adding same logic to Append
                else if (node.type === "append" && item.text === "Append") {
                    item.text = "Insert";
                    item.click = undefined;
                    item.submenu = createValidInsertMenu(item.submenu, currentJson, parentPath);
                }

                // if removeNode validation returns error
                // Remove default Remove(Delete) function and alert the error
                // except for ErrorType.InvalidPath
                else if (item.text === "Remove") {
                    item.title = "Remove this field";
                    if (removePossibility.error) {
                        // allows Remove even it has InvalidPath error
                        if (removePossibility.error.type === ErrorType.InvalidPath) {
                            item.title = "Remove this field. This field contains an invalid path";
                        }
                        else {
                            item.className = "warning-triangle";
                            switch (removePossibility.error.type) {
                                case ErrorType.RequiredNode:
                                    item.title = "Canot Remove. This field is mandatory";
                                    item.click = () => { alert("Error: Canot Remove. This field is mandatory"); }
                                    break;
                                case ErrorType.MinLength:
                                    item.title = "Canot Remove. Array has a minimum length";
                                    item.click = () => { alert("Error: Canot Remove. Array has a minimum length"); }
                                    break;
                                default:
                                    item.title = "Canot Remove.";
                                    item.click = () => { alert("Error: Canot Remove."); }
                                    break;
                            }
                        }
                    }
                }
            });

            // remove unwanted menu items
            menuItems = menuItems.filter(item => {
                return item.text !== "Type" &&
                    item.text !== "Sort" &&
                    item.text !== "Transform" &&
                    item.text !== "Extract" &&
                    item.text !== "Duplicate" &&
                    item.text !== "Append" &&
                    item.type !== "separator"
            })

            return menuItems;
        },
        autocomplete: {
            filter: 'start',
            trigger: 'focus',
            getOptions: (text: string, path: JSONPath) => {
                return new Promise((resolve, reject) => {
                    const options = addNode([...path]).resultNode;
                    if (options && options instanceof StringNode) {
                        if (options.possibleValues && options.possibleValues.length > 0) {
                            resolve(options.possibleValues)
                        } else {
                            reject()
                        }
                    }
                });
            }
        }
    }

    useEffect(() => {
        if (jsonEditorElm.current !== null) {
            // create the editor
            const container = jsonEditorElm.current;
            jsonEditorInstance.current = new JSONEditor(container, options);
            JsonConfigCommandCenter.editorInstance = jsonEditorInstance.current;
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
