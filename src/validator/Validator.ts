import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNode } from "./util/Helper";
import { DataType } from "./enum/DataType.enum";
import { AdditionalNode } from "./nodes/AdditionalNode";
import { ArrayNode } from "./nodes/ArrayNode";

export interface TemplateNode {
  key: string;
  data: Record<string, unknown>;
  node: BaseNode;
  sample: any;
}
const defaultGroup = "TwinConfiguration";

export const rootDataNode: { [key: string]: BaseNode } = {};
const allNodes: TemplateNode[] = [];

export const getNodeMeta = (
  paths: (string | number)[],
  rootJson: any,
  group: string = defaultGroup
): IValidationResult => {
  return getNode(group, rootDataNode, rootJson, paths);
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
  const result = getNode(group, root, data, paths);
  const resultParent =
    paths.length > 1
      ? getNode(group, root, data, paths.slice(0, paths.length - 1))
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
  if (node instanceof AdditionalNode || node instanceof ArrayNode) {
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

          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true, {
              description: "root",
              type: "",
              properties: {},
            });
            rootDataNode[key] = childrenNodes;
          }

          // Populate root nodes
          for (const key1 of Object.keys(rootSchema)) {
            const group = rootDataNode[key1];

            if (group.data) {
              for (const [key2, val2] of Object.entries(group.data)) {
                if (group.type === DataType.object) {
                  allNodes.push({
                    key: key1 + ":" + key2,
                    node: val2,
                    data: getJson(group)[key2],
                    sample: getSample((group.data as any)[key2]),
                  });
                }
              }
            }
          }
          console.log("Schema YML!", rootSchema);
          console.log("Schema Node!", rootDataNode);
          (window as any)["nodes"] = rootDataNode;
          console.log("All Nodes", allNodes);
          console.log("JSON->", getJson(rootDataNode[defaultGroup]));
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
