import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { populateChildren } from "../util/NodeFactory";
import { DataType } from "../enum/DataType.enum";
import { BaseNode, IDataNodeMap } from "../nodes/BaseNode";

let rootDataNode: BaseNode;

export const generateTemplate = (
  paths: { isArray: boolean; val: string | number }[]
): IValidationResult => {
  let resultNode = { ...rootDataNode };

  for (const path of paths) {
    let next;
    if (path.isArray) {
      next = (resultNode.data as BaseNode[])[path.val as number];
    } else {
      next = (resultNode.data as IDataNodeMap)[path.val as string];
    }
    
    if (!next) {
      return {
        resultNode: null,
        error: {
          type: ErrorType.InvalidPath,
        },
      };
    }
    resultNode = next;
  }
  return { resultNode };
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
              type: '',
              description: "Root Data Node"
            },
            {},
            true
          );
          for (const val of Object.values(rootSchema)) {
            const cn = populateChildren(val as ISchemaNode, true);
            if (rootDataNode.type === DataType.unspecified) {
              rootDataNode.data = {
                ...(rootDataNode.data as IDataNodeMap),
                ...(cn.data as IDataNodeMap),
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
