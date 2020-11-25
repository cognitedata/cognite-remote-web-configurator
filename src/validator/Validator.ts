import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNode, removeDataNode } from "./util/Helper";
import { DataType } from "./enum/DataType.enum";

export interface TemplateNode {
  key: string;
  data: Record<string, unknown>;
  node: BaseNode;
}
const defaultGroup = "TwinConfiguration";

const rootDataNode: { [key: string]: BaseNode } = {};
const allNodes: TemplateNode[] = [];

export const addNode = (
  paths: (string | number)[],
  group: string = defaultGroup
): IValidationResult => {
  return getNode(group, rootDataNode, paths);
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
  const result = getNode(group, root, paths);

  if (!result.error) {
    if (result.resultNode?.isRequired) {
      return {
        group,
        error: {
          type: ErrorType.RequiredNode,
        },
      };
    } else {
      return {
        group,
        resultNode: null,
        resultData: removeDataNode(data, paths),
      };
    }
  }
  return result;
};

export const loadSchema = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    YAML.load(ymlFile, (ymlJson: any) => {
      SwaggerParser.validate(ymlJson, (err, api) => {
        if (api) {
          const rootSchema = api.components.schemas;
          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);
            rootDataNode[key] = childrenNodes;
          }

          // Populate root nodes
          for (const key1 of Object.keys(rootSchema)) {
            
            const childrenNodes = rootDataNode[key1];

            if (childrenNodes.data) {
              for (const [key2, val2] of Object.entries(childrenNodes.data)) {
                if (childrenNodes.type === DataType.object) {
                  allNodes.push({
                    key: key1 + ":" + key2,
                    node: val2,
                    data: getJson(rootDataNode[key1])[key2],
                  });
                }
              }
            }
          }
          console.log("Schema YML!", rootSchema);
          console.log("Schema Node!", rootDataNode);
          // console.log('All Nodes', allNodes);
          // console.log('JSON->', getJson(rootDataNode[defaultGroup]));
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
