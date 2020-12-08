import { EditableNode, FieldEditable, JSONEditorOptions, JSONPath, MenuItem, MenuItemNode } from "jsoneditor";
import { addNode, getAllNodes, removeNode } from "../validator/Validator";
import { ErrorType } from "../validator/interfaces/IValidationResult";
import { StringNode } from "../validator/nodes/StringNode";
import { JsonConfigCommandCenter } from "./JsonConfigCommandCenter";
import { AdditionalNode } from "../validator/nodes/AdditionalNode";
import { BaseNode, BaseNodes, IData } from "../validator/nodes/BaseNode";
import { ArrayNode } from "../validator/nodes/ArrayNode";
import { DataType } from "../validator/enum/DataType.enum";

const extractField = (key: string) => {
    return key.split(":")[1]
}

export class CogniteJsonEditorOptions implements JSONEditorOptions {

    public get options(): JSONEditorOptions {
        return {
            mode: this.mode,
            templates: this.templates,
            autocomplete: this.autocomplete,
            enableSort: this.enableSort,
            indentation: this.indentation,
            escapeUnicode: this.escapeUnicode,
            enableTransform: this.enableTransform,
            onCreateMenu: ((menuItems: MenuItem[], node: MenuItemNode) => {
                return this.onCreateMenu(menuItems, node);
            }),
            onEditable: this.onEditable,
        }
    }

    public mode: "tree" | "code" | "preview" | undefined = 'tree';

    public get templates(): any {
        return getAllNodes()
            .map(node => [node])// each node is put to its own array for reduce function
            .reduce((acc: any[], singleNodeArr: any[]): any[] => {
                const node = singleNodeArr.pop();

                if (node) {
                    const key = extractField(node.key)

                    const temp = {
                        text: key,
                        title: node.node.description,
                        className: 'jsoneditor-type-object',
                        field: key,
                        value: node.data
                    }
                    acc.push(temp);

                    /**
                     * if node type is array or map
                     * adding sample data as a template
                     */
                    if (node.node.type === "array" || node.node.type === "map") {
                        const temp = {
                            text: `${key}-sample`,
                            title: `Add sample item to ${key}`,
                            className: 'jsoneditor-type-object',
                            field: `${key}-sample`,
                            value: node.sample
                        }
                        acc.push(temp);
                    }
                }
                return acc;
            });
    }

    // remove unwanted items from top Command Bar
    public enableSort = false;
    public enableTransform = false;

    public indentation = 4;
    public escapeUnicode = true;

    public onCreateMenu(menuItems: MenuItem[], node: MenuItemNode): any[] {

        const editor = JsonConfigCommandCenter.editor;

        if(!editor) {
            console.error("Editor returned as null!");
            return menuItems;
        }
        // get current state
        const currentJsonText = editor.getText();
        let currentJson: any;
        if (currentJsonText) {
            currentJson = JSON.parse(currentJsonText);
        }

        const path = node.path;
        // get parent Path for add function
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
                item.submenu = this.createValidInsertMenu(item.submenu, currentJson, parentPath);
            }
            // adding same logic to Append
            else if (node.type === "append" && item.text === "Append") {
                item.text = "Insert";
                item.click = undefined;
                item.submenu = this.createValidInsertMenu(item.submenu, currentJson, parentPath);
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
                    } else {
                        item.className = "warning-triangle";
                        switch (removePossibility.error.type) {
                            case ErrorType.RequiredNode:
                                item.title = "Cannot Remove. This field is mandatory";
                                item.click = () => {
                                    alert("Error: Cannot Remove. This field is mandatory");
                                }
                                break;
                            case ErrorType.MinLength:
                                item.title = "Cannot Remove. Array has a minimum length";
                                item.click = () => {
                                    alert("Error: Cannot Remove. Array has a minimum length");
                                }
                                break;
                            default:
                                item.title = "Cannot Remove.";
                                item.click = () => {
                                    alert("Error: Cannot Remove.");
                                }
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
    }

    public get autocomplete(): any {
        return {
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
        };
    }

    public onEditable(node: any): boolean | FieldEditable {
        const path: (string | number)[] = (node as EditableNode).path;

        if (path && path?.length !== 0) {
            const parentPath = [...path];
            const leafNode = parentPath.pop();
            const resultNode = addNode(parentPath).resultNode;
            const readOnlyFields = resultNode?.readOnlyFields;

            /**
             * if read only fields exists and
             * current considering node (leafNode) is a read only field
             */
            if (readOnlyFields?.length !== 0 && readOnlyFields?.includes(`${leafNode}`)) {
                return {
                    field: true,
                    value: false
                }
            }
        }
        return true;
    }

    private createValidInsertMenu(submenu: MenuItem[] | undefined, currentJson: any, parentPath: (string | number)[]): any {
        const validMenuItems: MenuItem[] = [];
        const resultNode = addNode([...parentPath]).resultNode;

        const validInsertItems: any = this.getValidInsertItems(parentPath, currentJson, resultNode);
        const existingKeys: (number | string)[] = Object.keys(this.getPathObject(currentJson, [...parentPath]));

        if (submenu === undefined || submenu.length === 0) {
            return undefined;
        }

        submenu?.forEach(subItem => {
            if (validInsertItems !== undefined && validInsertItems.length !== 0) {
                // let matchingItemCountWithSameDesc = 0;

                Object.keys(validInsertItems).forEach((key: any) => {
                    if ((subItem.text === key)
                        && (subItem.title === validInsertItems[key].description)
                        && !existingKeys.includes(key)) {
                        /**
                         * filter already added items from insert menu
                         * unless it's map
                         */
                        // if (!(resultNode instanceof AdditionalNode)) {
                        //     validMenuItems.push(subItem);
                        //     existingKeys.push(key);
                        // }
                        // if(resultNode instanceof AdditionalNode) {
                        validMenuItems.push(subItem);
                        existingKeys.push(key);
                        // }
                        // matchingItemCountWithSameDesc++;
                    }
                });

                // if (matchingItemCountWithSameDesc > 1) {
                //     alert("Invalid schema. Different keys should not exists with same description.");
                // }
            }
        });

        return validMenuItems;
    }

    private getPathObject(json: any, path: (number | string)[]): any {
        let subTree = json;
        path.forEach((step: number | string) => {
            subTree = subTree[step];
        });
        return subTree;
    }

    private getValidInsertItems(parentPath: (string | number)[], currentJson: any, node: BaseNode | undefined | null): IData {
        const key = parentPath[parentPath.length - 1]
        let resultNode = addNode([...parentPath]).resultNode;

        if(node?.discriminator){
            const currentData = this.getPathObject(currentJson, parentPath);
            const typeKey = node.discriminator.propertyName;
            const dataType = currentData[typeKey];
            resultNode = (node.data as BaseNodes)[dataType];
        }

        /**
         * When adding items to an Array or a Map,
         * returning a IData object with matching key and description
         */
        if (resultNode instanceof ArrayNode || resultNode instanceof AdditionalNode) {
            if (resultNode.sampleData.discriminator) {
                // TODO: Check is this possible for other type of nodes
                return resultNode.sampleData.data;
            }
            const ret: BaseNodes = {
                [`${key}-sample`]: new BaseNode(DataType.unspecified, { type: DataType.object, description: `Add sample item to ${key}` }, undefined, true)
            }
            return ret;
        }
        else {
            return resultNode?.data;
        }
    }
}
