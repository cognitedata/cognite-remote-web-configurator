import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { RefType } from "../enum/RefType.enum";
import { populateChildren } from "../util/NodeFactory";
import { DataNode, IDataNodeMap } from "../interfaces/IDataNode";
import { DataType } from "../enum/DataType.enum";

let rootDataNode: DataNode;

export const generateTemplate = (
  paths: { refType: RefType; val: string | number }[]
): IValidationResult => {
  let resultNode = { ...rootDataNode };

  for (const path of paths) {
    let next;
    if (path.refType === RefType.Object) {
      next = (resultNode.data as IDataNodeMap)[path.val as string];
    } else {
      next = (resultNode.data as DataNode[])[path.val as number];
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
          rootDataNode = new DataNode(
            DataType.unspecified,
            "Root Data Node",
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
