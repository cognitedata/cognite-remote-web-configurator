import { DataType, IDataNode } from "../interfaces/IDataNode";
import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { ParseType } from "../util/Parser";

let rootDataNode: IDataNode;

const childrenNodes = (schema: ISchemaNode): IDataNode => {
  const obj: IDataNode = {
    type: DataType.unspecified,
    data: {}
  };

  if (schema.properties) {
    for (const [key, val] of Object.entries(schema.properties)) {
      obj.data[key] = childrenNodes(val);
    }
    return obj;
  } else {
    // obj.leaf = true;
    // switch(schema.type){

    // }
    obj.type = ParseType(schema.type);
    return obj;
  }
};

export const generateTemplate = (paths: string[]): IValidationResult => {
  let resultNode = { ...rootDataNode };

  for (const path of paths) {
    const next = resultNode.data[path];
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

          rootDataNode = {
              data: {},
              type: DataType.unspecified
          };
          for (const [key, val] of Object.entries(rootSchema)){
            const cn = childrenNodes(val as ISchemaNode);
            rootDataNode.data = {...rootDataNode.data, ...cn.data};
          }

          console.log("Schema Loaded!", rootDataNode);
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
