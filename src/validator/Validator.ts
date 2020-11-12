import { DataType, IDataNode } from "../interfaces/IDataNode";
import YAML from "yamljs";
import ymlFile from "./twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";

let rootSchema: any;

const childrenNodes = (schema: ISchemaNode): IDataNode => {
  const obj: IDataNode = {
    metaType: DataType.unspecified,
  };
  if (schema.properties) {
    for (const [key, val] of Object.entries(schema.properties)) {
      obj[key] = childrenNodes(val);
    }
    return obj;
  } else {
    obj.leaf = true;
    // switch(schema.type){

    // }
    obj.meta = schema.type;
    return obj;
  }
};

export const generateTemplate = (paths: string[]): IValidationResult => {
  let schemaNode = { ...rootSchema };
  for (const path of paths) {
    const next = schemaNode[path];
    if (!next) {
      // Invalid Path
      return {
        resultNode: null,
        error: {
          type: ErrorType.InvalidPath,
        },
      };
    }
    schemaNode = next;
  }
  const resultNode = childrenNodes(schemaNode);
  console.log(resultNode);
  return { resultNode };
};

export const loadSchema = () => {
  return new Promise((resolve, reject) => {
    YAML.load(ymlFile, (ymlJson: any) => {
      SwaggerParser.validate(ymlJson, (err, api) => {
        if (api) {
          rootSchema = api.components.schemas;
          console.log("Schema Loaded!", rootSchema);
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
