import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { ArrayNode } from "../nodes/ArrayNode";
import { BaseNode, IDataNodeMap } from "../nodes/BaseNode";
import { BooleanNode } from "../nodes/BooleanNode";
import { NumberNode } from "../nodes/NumberNode";
import { ObjectNode } from "../nodes/ObjectNode";
import { StringNode } from "../nodes/StringNode";
import { ParseType } from "./Parsers";

export const populateChildren = (schema: ISchemaNode, isRequired: boolean): BaseNode => {
    if (schema.properties) {
      const obj: BaseNode = new BaseNode(
        ParseType(schema.type),
        schema.description,
        {},
        isRequired
      );
      for (const [key, val] of Object.entries(schema.properties)) {
        const required = schema.required?.findIndex((s) => s === key) >= 0;
        (obj.data as IDataNodeMap)[key] = populateChildren(val, required);
      }
      return obj;
    } else {
      switch (schema.type) {
        case "array":
          return new ArrayNode( schema, isRequired);
        case "string":
          return new StringNode(schema, '', isRequired);
        case "number":
          return new NumberNode(schema.description, 0, isRequired);
        case "boolean":
          return new BooleanNode(schema.description, false, isRequired);
        case "object":
          return new ObjectNode(schema.description, {}, isRequired);
        default:
          return new BaseNode(DataType.unspecified, schema.description, [], isRequired);
      }
    }
  };