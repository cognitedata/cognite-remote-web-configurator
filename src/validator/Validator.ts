import { ArrayNode, BooleanNode, DataNode, DataType, IDataNodeMap, NumberNode, ObjectNode, StringNode } from "../interfaces/IDataNode";
import YAML from "yamljs";
import ymlFile from "../config/twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { ParseType } from "../util/TypeParser";
import { RefType } from "../enum/RefType.enum";

let rootDataNode: DataNode;

const childrenNodes = (schema: ISchemaNode, isRequired: boolean): DataNode => {
  if (schema.properties) {
    const obj: DataNode = new DataNode(
      ParseType(schema.type),
      schema.description,
      {},
      isRequired
    );
    for (const [key, val] of Object.entries(schema.properties)) {
      const required = schema.required?.findIndex((s) => s === key) >= 0;
      (obj.data as IDataNodeMap)[key] = childrenNodes(val, required);
    }
    return obj;
  } else {
    switch (schema.type) {
      case "array":
        return new ArrayNode( schema.description, [], isRequired);
      case "string":
        return new StringNode(schema.description, '', isRequired);
      case "number":
        return new NumberNode(schema.description, [], isRequired);
      case "boolean":
        return new BooleanNode(schema.description, [], isRequired);
      case "object":
        return new ObjectNode(schema.description, [], isRequired);
      default:
        return new DataNode(DataType.unspecified, schema.description, [], isRequired);
    }
  }
};

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
            const cn = childrenNodes(val as ISchemaNode, true);
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
