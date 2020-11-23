import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "./interfaces/IValidationResult";
import { populateChildren } from "./util/NodeFactory";
import { BaseNode } from "./nodes/BaseNode";
import { getJson, getNode, removeDataNode } from "./util/Helper";
import { ObjectNode } from "./nodes/ObjectNode";

const defaultGroup = 'TwinConfiguration';

const rootDataNode: {[key: string]: BaseNode} = {};

export const addNode = (
  paths: (string | number)[],
  group: string = defaultGroup
): IValidationResult => {
  return getNode(rootDataNode[group], paths);
};

export const removeNode = (
  data: Record<string, unknown>,
  paths: (string | number )[],
  group: string = defaultGroup
): IValidationResult => {
  const root = { ...rootDataNode[group] };
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
          // rootDataNode = new ObjectNode(
          //   rootSchema,
          //   {},
          //   true
          // );
          // let output: any = {};
          // const arr = [];
          for (const [key, val] of Object.entries(rootSchema)) {
            const childrenNodes = populateChildren(val as ISchemaNode, true);
            rootDataNode[key] = childrenNodes;
            // console.log(childrenNodes.data);
            // if (!childrenNodes.type) {
              // output = {
              //   ...(output),
              //   ...(childrenNodes.data as Record<string, unknown>),
              // };
              // arr.push(childrenNodes.data);
            // }
          }
          // rootDataNode.data = output;
          console.log("Schema YML!", rootSchema[defaultGroup]);
          console.log("Schema Node!", rootDataNode[defaultGroup]);
          // console.log("Schema Arr!", arr);
          // (window as any)['aaa'] = output;

          console.log('JSON->', getJson(rootDataNode[defaultGroup]))
        } else {
          console.error(err);
          reject();
        }
      });
    });
  });
};
