import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { DataType } from "./enum/DataType.enum";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNode, removeDataNode } from "./util/Helper";

let rootDataNode: BaseNode;

export const addNode = (
  paths: (string | number)[]
): IValidationResult => {
  return getNode(rootDataNode, paths);
};

export const removeNode = (
  data: Record<string, unknown>,
  paths: (string | number )[]
): IValidationResult => {
  const root = { ...rootDataNode };
  const result = getNode(root, paths);

  if (!result.error) {
    if(result.resultNode?.isRequired){
      return {
        error: {
          type: ErrorType.RequiredNode
        }
      }
    }else {  
      return {
        resultNode: null,
        resultData: removeDataNode(data, paths)
      }
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
          let output: any = {};
          for (const val of Object.values(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);
            // console.log(childrenNodes.data);
            // if (!childrenNodes.type) {
              output = {
                ...(output),
                ...(childrenNodes.data as Record<string, unknown>),
              };
            // }
          }
          rootDataNode.data = output;
          console.log("Schema YML!", rootSchema);
          console.log("Schema Node!", rootDataNode);

          // (window as any)['aaa'] = output;

          console.log('JSON->', getJson(rootDataNode))
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
