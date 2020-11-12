import { DataType, IDataNode, IDataNodeMap } from "../interfaces/IDataNode";
import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { ParseType } from "../util/Parser";
import { RefType } from "../enum/RefType.enum";

let rootDataNode: IDataNode;

const childrenNodes = (schema: ISchemaNode): IDataNode => {
  const obj: IDataNode = {
    type: DataType.unspecified,
    data: {},
  };

  if (schema.properties) {
    for (const [key, val] of Object.entries(schema.properties)) {
      (obj.data as IDataNodeMap)[key] = childrenNodes(val);
    }
    return obj;
  } else {
    // obj.leaf = true;
    switch (schema.type) {
      case "array":
        obj.type = DataType.array;
        obj.data = [];
        return obj;
      default:
        obj.type = ParseType(schema.type);
        return obj;
    }
  }
};

export const generateTemplate = (paths: {refType: RefType, val: string | number}[]): IValidationResult => {
  let resultNode = { ...rootDataNode };

  for (const path of paths) {
    let next;
    if(path.refType === RefType.Object){
        next = (resultNode.data as IDataNodeMap)[path.val as string];
    } else {
        next = (resultNode.data as IDataNode[])[path.val as number];
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
          rootDataNode = {
            data: {},
            type: DataType.unspecified,
          };
          for (const val of Object.values(rootSchema)) {
            const cn = childrenNodes(val as ISchemaNode);
            rootDataNode.data = { ...rootDataNode.data, ...cn.data };
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
