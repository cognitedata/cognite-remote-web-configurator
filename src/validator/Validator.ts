import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNode, removeDataNode } from "./util/Helper";

const defaultGroup = "TwinConfiguration";

const rootDataNode: { [key: string]: BaseNode } = {};
const allNodes: any = [];

export const addNode = (
  paths: (string | number)[],
  group: string = defaultGroup
): IValidationResult => {
  return getNode(rootDataNode[group], paths);
};

export const getAllNodes = (): IValidationResult => {
  return allNodes;
};

export const removeNode = (
  data: Record<string, unknown>,
  paths: (string | number)[],
  group: string = defaultGroup
): IValidationResult => {
  const root = { ...rootDataNode[group] };
  const result = getNode(root, paths);

  if (!result.error) {
    if (result.resultNode?.isRequired) {
      return {
        error: {
          type: ErrorType.RequiredNode,
        },
      };
    } else {
      return {
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

          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);
            rootDataNode[key] = childrenNodes;

            if (childrenNodes.data) {
              for (const [key2, val2] of Object.entries(childrenNodes.data)) {
                if (val2.data) {
                  allNodes.push({
                    key: key + ":" + key2,
                    node: val2,
                    data: getJson(rootDataNode[key])[key2],
                  });
                }
              }
            }
          }
          // console.log("Schema YML!", rootSchema[defaultGroup]);
          // console.log("Schema Node!", rootDataNode[defaultGroup]);
          // console.log('All Nodes', allNodes);
          // console.log('JSON->', getJson(rootDataNode[defaultGroup]))
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
