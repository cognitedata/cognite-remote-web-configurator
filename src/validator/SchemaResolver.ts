import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNodeInstance } from "./util/Helper";
import { DataType } from "./enum/DataType.enum";
import { MapNode } from "./nodes/MapNode";
import { ArrayNode } from "./nodes/ArrayNode";
import { JsonConfigCommandCenter } from "../core/JsonConfigCommandCenter";
import { SchemaValidator } from "./SchemaValidator";
import { ITemplateNode } from "./interfaces/ITemplateNode";
import { NodeFactory } from "./util/NodeFactory";
import { IOpenApiSchema } from "./interfaces/IOpenApiSchema";

const defaultGroup = "TwinConfiguration"; 
export class SchemaResolver {

  private static allNodes: ITemplateNode[] = [];
  private static rootDataNode: { [key: string]: BaseNode } = {};

  public static getNodeMeta(
    paths: (string | number)[],
    rootJson: any,
    group: string = defaultGroup
  ): IValidationResult {
    return getNodeInstance(group, this.rootDataNode, rootJson, paths);
  }

  public static getRootDataNode() {
    return this.rootDataNode
  }

  public static getAllNodes(): ITemplateNode[] {
    return this.allNodes;
  }

  public static removeNode(
    data: Record<string, unknown>,
    paths: (string | number)[],
    group: string = defaultGroup
  ): IValidationResult {
    const root = { ...this.rootDataNode };
    // TODO: Can we avoid 2 calls to getNodeInstance
    const result = getNodeInstance(group, root, data, paths);
    const resultParent =
      paths.length > 1
        ? getNodeInstance(group, root, data, paths.slice(0, paths.length - 1))
        : null;

    if (!result.error) {
      if (result.resultNode?.isRequired) {
        return {
          group,
          error: {
            type: ErrorType.RequiredNode,
          },
        };
      } else {
        if (
          resultParent &&
          resultParent.resultNode instanceof ArrayNode &&
          resultParent.resultNode.minItems
        ) {
          let subTree = data;
          paths.slice(0, paths.length - 1).forEach((step: number | string) => {
            subTree = subTree[step] as Record<string, unknown>;
          });

          if (
            ((subTree as unknown) as any[]).length <=
            resultParent.resultNode.minItems
          ) {
            return {
              group,
              error: {
                type: ErrorType.MinLength,
              },
            };
          }
        }

        return {
          group,
          resultNode: null,
        };
      }
    }
    return result;
  }

  private static getSample(node: BaseNode) {
    if (node instanceof MapNode || node instanceof ArrayNode) {
      const sample = node.sampleData;
      const js = getJson(sample);
      return js;
    }
    return null;
  }

  public static parseYAMLFile(ymlJson: IOpenApiSchema) {

    return new Promise((resolve, reject) => {
   
      // Initialize static data befor switch the schema
      this.rootDataNode = {};
      this.allNodes = [];

      // propUniqueIdentifire is a counter which is used to make the description is unique for all schemaTypes.
      // Otherwise schema types cannot be identified uniquely from allTemplates array
      let propUniqueIdentifire = 0;

      const nodeFactory = new NodeFactory();
    
      const unresolvedSchema = ymlJson.components.schemas;
      SchemaValidator.validateUnresolvedSchema(unresolvedSchema);
  
      SwaggerParser.validate(ymlJson, (err, api) => {
        if (api) {
          const rootSchema = api.components.schemas;
  
          // Assign a unique identifire for all the property descriptions
          for (const val of Object.values(rootSchema)) {
            const schemaNode = val as ISchemaNode;
            schemaNode.description = `${schemaNode.description}${++propUniqueIdentifire}`;
  
            if (schemaNode.properties) {
              for (const c of Object.values(schemaNode.properties)) {
                c.description = `${c.description}${++propUniqueIdentifire}`;
              }
            }
          }
  
          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = nodeFactory.populateChildren(val as ISchemaNode, true);
            this.rootDataNode[key] = childrenNodes;
          }
  
          // Populate root nodes
          for (const [key1, group] of Object.entries(this.rootDataNode)) {
            if (group.data) {
              for (const [key2, val2] of Object.entries(group.data)) {
                if (group.type === DataType.object) {
                  this.allNodes.push({
                    key: key1 + ":" + key2,
                    node: val2,
                    data: getJson(group, true)[key2],
                    sample: SchemaResolver.getSample((group.data as any)[key2]), // Used only for Array, Map
                  });
                }
              }
            }
          }
          console.log("Schema YML", rootSchema);
          console.log("Schema Node", this.rootDataNode);
          resolve(true);
        } else {
          JsonConfigCommandCenter.schemaErrors.push(
            "Configuration Schema has errors! Validations may not work as expected"
          );
          console.error(err);
          reject();
        }
      });
    })
  }
}