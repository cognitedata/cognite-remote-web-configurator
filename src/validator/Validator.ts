import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNodeInstance } from "./util/Helper";
import { DataType } from "./enum/DataType.enum";
import { MapNode } from "./nodes/MapNode";
import { ArrayNode } from "./nodes/ArrayNode";

export interface TemplateNode {
  key: string;
  data: Record<string, unknown>;
  node: BaseNode;
  sample: any;
}
const defaultGroup = "TwinConfiguration";
export const rootDataNode: { [key: string]: BaseNode } = {};

// propCount in a counter which is used to make the description is uniquie for all schemaTypes. 
// Otherwise schema types cannot be identified uniquely from templates array
let propCount = 0;

const allNodes: TemplateNode[] = [];

export const getNodeMeta = (
  paths: (string | number)[],
  rootJson: any,
  group: string = defaultGroup
): IValidationResult => {
  return getNodeInstance(group, rootDataNode, rootJson, paths);
};

export const getAllNodes = (): TemplateNode[] => {
  return allNodes;
};

export const removeNode = (
  data: Record<string, unknown>,
  paths: (string | number)[],
  group: string = defaultGroup
): IValidationResult => {
  const root = { ...rootDataNode };
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
};

const getSample = (node: BaseNode) => {
  if (node instanceof MapNode || node instanceof ArrayNode) {
    const sample = node.sampleData;
    const js = getJson(sample);
    return js;
  }
  return null;
};

export const loadSchema = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    YAML.load(ymlFile, (ymlJson: any) => {
      SwaggerParser.validate(ymlJson, (err, api) => {
        if (api) {
          const rootSchema = api.components.schemas;

          // Assign a unique identifire for all the property descriptions
          for (const val of Object.values(rootSchema)) {
            const schemaNode = val as ISchemaNode;
            schemaNode.description = `${schemaNode.description}${++propCount}`;

            if(schemaNode.properties){
              for(const c of Object.values(schemaNode.properties)){
                c.description = `${c.description}${++propCount}`;
              }
            }
          }

          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);
            rootDataNode[key] = childrenNodes;
          }

          // Populate root nodes
          for (const [key1, group] of Object.entries(rootDataNode)) {
            if (group.data) {
              for (const [key2, val2] of Object.entries(group.data)) {
                if (group.type === DataType.object) {
                  allNodes.push({
                    key: key1 + ":" + key2,
                    node: val2,
                    data: getJson(group, true)[key2],
                    sample: getSample((group.data as any)[key2]), // Used only for Array, Map
                  });
                }
              }
            }
          }
          console.log("Schema YML", rootSchema);
          console.log("Schema Node", rootDataNode);
          console.log("All Nodes", allNodes);
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
