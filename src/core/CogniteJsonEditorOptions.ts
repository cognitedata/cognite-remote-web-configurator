import {
    EditableNode,
    FieldEditable,
    JSONEditorOptions,
    JSONPath,
    MenuItem,
    MenuItemNode,
    ValidationError
} from "jsoneditor";
import { getNodeMeta, getAllNodes, removeNode } from "../validator/Validator";
import { ErrorType } from "../validator/interfaces/IValidationResult";
import { StringNode } from "../validator/nodes/StringNode";
import { JsonConfigCommandCenter } from "./JsonConfigCommandCenter";
import { AdditionalNode } from "../validator/nodes/AdditionalNode";
import { BaseNode, BaseNodes, IData } from "../validator/nodes/BaseNode";
import { ArrayNode } from "../validator/nodes/ArrayNode";
import { DataType } from "../validator/enum/DataType.enum";
import { getJson } from "../validator/util/Helper";

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
            onValidate: this.onValidate,
        }
    }

    public mode: "tree" | "code" | "preview" | undefined = 'tree';

    public get templates(): any {
        const allTemplates: any = [];
        getAllNodes().forEach(ele => {
            const key = extractField(ele.key);
            const pureObj = {
                text: key,
                title: ele.node.description,
                className: 'jsoneditor-type-object',
                field: key,
                value: ele.data
            }
            allTemplates.push(pureObj);

            if (ele.node.discriminator && ele.node.data) {
                // If discriminator exists, add all sub types as templates
                Object.entries(ele.node.data).forEach(([subKey, subVal]) => {
                    const temp = {
                        text: `${key}-${subKey}`,
                        title: `Add sample item to ${key}`,
                        className: "jsoneditor-type-object",
                        field: `${key}`,
                        value: getJson(subVal as BaseNode),
                    };
                    allTemplates.push(temp);
                });
            }

            if (ele.node.type === "array" || ele.node.type === "map") {
                const temp = {
                    text: `${key}-sample`,
                    title: `Add sample item to ${key}`,
                    className: 'jsoneditor-type-object',
                    field: `${key}-sample`,
                    value: ele.sample
                }
                allTemplates.push(temp);
            }

        });

        return allTemplates;
    }

    // remove unwanted items from top Command Bar
    public enableSort = false;
    public enableTransform = false;

    public indentation = 4;
    public escapeUnicode = true;

    public onCreateMenu(menuItems: MenuItem[], node: MenuItemNode): any[] {

        const editor = JsonConfigCommandCenter.editor;

        if (!editor) {
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
                    const options = getNodeMeta([...path]).resultNode;
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

    public onEditable(node: EditableNode | any): boolean | FieldEditable {
        const path: (string | number)[] = (node as EditableNode).path;

        if (path && path?.length !== 0) {
            const parentPath = [...path];
            const leafNode = parentPath.pop();
            const resultNode = getNodeMeta(parentPath).resultNode;
            let readOnlyFields: string[] = [];

            if (resultNode?.discriminator) { // get readonly fields from all discriminated types
                const discriminatorTypes = resultNode.data as BaseNodes;
                const readonlyFieldsInDiscriminatorTypes = new Set<string>();
                for (const key of Object.keys(discriminatorTypes)) {
                    const value = discriminatorTypes[key];
                    value.readOnlyFields.forEach(val => readonlyFieldsInDiscriminatorTypes.add(val));
                }
                readOnlyFields = Array.from(readonlyFieldsInDiscriminatorTypes);
            } else {
                readOnlyFields = resultNode?.readOnlyFields ?? [];
            }

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

    public onValidate = (json: any): ValidationError[] | Promise<ValidationError[]> => {

        const schemaMeta = getNodeMeta([])?.resultNode?.data; // meta of root node from schema
        const errors = this.validateFields(json, schemaMeta);

        return errors;
    }

    /**
     * Validates if
     * 1. All required keys from schema are available
     * 2. there are no invalid keys
     * 3. Discriminate properties are available and follows the schema
     * @param json
     * @param schemaMeta
     * @param paths
     * @param errors
     * @private
     */
    private validateFields(json: any, schemaMeta: any, paths: any[] = [], errors: ValidationError[] = []): ValidationError[] {

        const missingRequiredFields = [];
        const validatedKeys = new Set<string>();

        for (const childKey of Object.keys(schemaMeta)) {
            const childNode = (schemaMeta)[childKey] as BaseNode;
            const isRequired = childNode.isRequired;

            const hasKey = Object.prototype.hasOwnProperty.call(json, childKey);

            if (!hasKey) {
                if (isRequired) {
                    missingRequiredFields.push(childKey);
                }
            } else {
                validatedKeys.add(childKey);
                const value = json[childKey];
                const newPath = paths.concat([childKey]);
                const childMeta = schemaMeta[childKey];

                let nextMeta: any;

                if(childMeta.type === DataType.map || childMeta.type === DataType.array) {
                    nextMeta = childMeta.sampleData.data;
                    const discriminator = childMeta.sampleData.discriminator;

                    const callNextIteration = (childKey: any, childValue: any) => {
                        if(discriminator) {
                            const childErrors = this.validateDiscriminator(childValue, nextMeta, discriminator, newPath);
                            errors = childErrors.concat(errors);
                        } else {
                            const childPath = newPath.concat([childKey]);
                            if(nextMeta) {
                                const childErrors = this.validateFields(childValue, nextMeta, childPath);
                                errors = childErrors.concat(errors);
                            }
                        }
                    }

                    if(childMeta.type === DataType.map) {
                        for(const mapChildKey of Object.keys(value)) {
                            const mapChild = value[mapChildKey];
                            callNextIteration(mapChildKey, mapChild);
                        }
                    } else {
                        for(let i = 0; i < value.length; i++) {
                            const mapChild = value[i];
                            callNextIteration(i, mapChild);
                        }
                    }
                } else {
                    nextMeta = childMeta.data;
                    const discriminator = childMeta.discriminator;
                    if(discriminator) {
                        const childErrors = this.validateDiscriminator(value, nextMeta, discriminator, newPath);
                        errors = childErrors.concat(errors);
                    } else {

                        if(nextMeta) {
                            const childErrors = this.validateFields(value, nextMeta, newPath);
                            errors = childErrors.concat(errors);
                        }
                    }
                }
            }


        }

        if(missingRequiredFields.length) {
            errors.push({path: paths, message: `Required fields: ${missingRequiredFields.join(',')} not available in object`})
        }

        for(const jsonChildKey of Object.keys(json)) { // validate unnecessary fields
            if(!validatedKeys.has(jsonChildKey)) {
                const newPath = paths.concat([jsonChildKey]);
                errors.push({path: newPath, message: `key: ${jsonChildKey}, is not a valid key!`});
            }
        }
        return errors;
    }

    private validateDiscriminator(json: any, schema: any, discriminator: { propertyName: string }, paths: any[], errors: ValidationError[] = []): ValidationError[] {
        const discriminatorType = json[discriminator.propertyName];

        if(discriminatorType) { // whether discriminator property is available
            const discriminatorMeta = schema[discriminatorType];
            if(discriminatorMeta) {
                const childErrors = this.validateFields(json, discriminatorMeta.data, paths);
                errors = childErrors.concat(errors);
            } else {
                errors.push({path: paths, message: `Discriminator type field ${discriminator.propertyName} does not have a valid type!`});
            }
        } else {
            errors.push({path: paths, message: `Discriminator type field ${discriminator.propertyName} not available!`});
        }
        return  errors;
    }

    private createValidInsertMenu(submenu: MenuItem[] | undefined, currentJson: any, parentPath: (string | number)[]): any {
        const validMenuItems: MenuItem[] = [];
        const resultNode = getNodeMeta([...parentPath]).resultNode;

        const validInsertItems: any = this.getValidInsertItems(parentPath, currentJson, resultNode);
        const existingKeys: (number | string)[] = Object.keys(this.getPathObject(currentJson, [...parentPath]));

        if (submenu === undefined || submenu.length === 0) {
            return undefined;
        }

        submenu?.forEach(subItem => {
            if (validInsertItems !== undefined && validInsertItems.length !== 0) {
                Object.keys(validInsertItems).forEach((key: any) => {
                    if ((subItem.text === key)
                        && (subItem.title === validInsertItems[key].description)
                        && !existingKeys.includes(key.split('-')[0])) {
                        validMenuItems.push(subItem);
                        existingKeys.push(key);
                    }
                });
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
        let resultNode = getNodeMeta([...parentPath]).resultNode;

        if (node?.discriminator) {
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
            if (resultNode.sampleData?.discriminator) {
                // TODO: Check is this possible for other type of nodes
                return resultNode.sampleData.data;
            }
            const ret: BaseNodes = {
                [`${key}-sample`]: new BaseNode(DataType.unspecified, {
                    type: DataType.object,
                    description: `Add sample item to ${key}`
                }, undefined, true)
            }
            return ret;
        }
        else {
            const res: any = resultNode?.data ? {...(resultNode.data as BaseNodes)} : {};

            Object.entries(resultNode?.data as Record<string, unknown>).forEach(
              ([subKey, subVal]) => {
                if ((subVal as BaseNode).discriminator) {
                    delete res[subKey];
                  Object.keys(
                    (subVal as BaseNode).data as Record<string, unknown>
                  ).forEach((desKey) => {
                    res[`${subKey}-${desKey}`] = {
                      description: `Add sample item to ${subKey}`,
                    };
                  });
                }
              }
            );
      
            return res;
        }
    }
}
