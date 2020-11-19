import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { AdditionalNode } from "../nodes/AdditionalNode";
import { ArrayNode } from "../nodes/ArrayNode";
import { BaseNode, BaseNodes } from "../nodes/BaseNode";
import { BooleanNode } from "../nodes/BooleanNode";
import { NumberNode } from "../nodes/NumberNode";
import { ObjectNode } from "../nodes/ObjectNode";
import { StringNode } from "../nodes/StringNode";
import { ParseType } from "./Parsers";

export const populateChildren = (schema: ISchemaNode, isRequired: boolean): BaseNode => {
    if (schema.properties) {
      const obj: BaseNode = new BaseNode(
        ParseType(schema.type),
        schema,
        {},
        isRequired
      );
      for (const [key, val] of Object.entries(schema.properties)) {
        const required = schema.required?.findIndex((s) => s === key) !== -1;
        (obj.data as BaseNodes)[key] = populateChildren(val, required);
      }
      return obj;
    } else if (schema.additionalProperties) {
      const sampleData: BaseNodes = {};
      for (const [key, val] of Object.entries(schema.additionalProperties.properties)) {
        const required = schema.additionalProperties.required?.findIndex((s) => s === key) !== -1;
        sampleData[key] = populateChildren(val, required);
      }

      const obj: AdditionalNode = new AdditionalNode(
        schema,
        {},
        false,
        sampleData
      );
      return obj;
    } else {
      switch (ParseType(schema.type)) {
        case DataType.array:
          return new ArrayNode( schema, isRequired);
        case DataType.string:
          return new StringNode(schema, '', isRequired);
        case DataType.number:
          return new NumberNode(schema, 0, isRequired);
        case DataType.boolean:
          return new BooleanNode(schema, false, isRequired);
        case DataType.object:
          return new ObjectNode(schema, {}, isRequired);
        default:
          return new BaseNode(DataType.unspecified, schema, [], isRequired);
      }
    }
  };