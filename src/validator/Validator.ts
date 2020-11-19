import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { DataType } from "./enum/DataType.enum";
import { BaseNode, BaseNodes } from "./nodes/BaseNode";
import { getNode } from "./util/Helper";

let rootDataNode: BaseNode;

export const addNode = (
  paths: (string | number)[]
): IValidationResult => {
  return getNode(rootDataNode, paths);
};

export const removeNode = (
  paths: (string | number )[]
): IValidationResult => {
  const root = { ...rootDataNode };
  const result = getNode(root, paths);

  if (!result.error) {
    console.log("Node exists");
  }

  return result;
};

export const loadSchema = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    YAML.load(ymlFile, (ymlJson: any) => {
      SwaggerParser.validate(ymlJson, (err, api) => {
        if (api) {
          const rootSchema = api.components.schemas;
          console.log(rootSchema.TwinConfiguration);
          rootDataNode = new BaseNode(
            DataType.unspecified,
            {
              properties: {},
              type: "",
              description: "Root Data Node",
            },
            {},
            true
          );
          for (const val of Object.values(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);

            if (childrenNodes.type === DataType.object) {
              rootDataNode.data = {
                ...(rootDataNode.data as BaseNodes),
                ...(childrenNodes.data as BaseNodes),
              };
            }
          }

          console.log("Schema YML!", rootSchema);
          console.log("Schema Node!", rootDataNode);
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
