import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { AdditionalNode } from "../nodes/AdditionalNode";
import { ArrayNode } from "../nodes/ArrayNode";
import { BaseNode, BaseNodes } from "../nodes/BaseNode";
import { BooleanNode } from "../nodes/BooleanNode";
import { NumberNode } from "../nodes/NumberNode";
import { ObjectNode } from "../nodes/ObjectNode";
import { StringNode } from "../nodes/StringNode";
import { getDefaultPrimitiveVal, ParseType } from "./Parsers";

const getPrimitiveObject = (schema: ISchemaNode, isRequired: boolean) => {
  if (!schema) {
    const node: BaseNode = {
      type: DataType.unspecified,
      data: {},
    };
    return node;
  }
  switch (ParseType(schema.type)) {
    case DataType.array:
      return new ArrayNode(schema, [], isRequired);
    case DataType.string:
      return new StringNode(schema, "", isRequired);
    case DataType.number:
      return new NumberNode(schema, 0, isRequired);
    case DataType.boolean:
      return new BooleanNode(schema, false, isRequired);
    case DataType.object:
      return new ObjectNode(schema, {}, isRequired);
    default:
      return new BaseNode(DataType.unspecified, schema, [], isRequired);
  }
};

export const populateChildren = (
  schema: ISchemaNode,
  isRequired: boolean
): BaseNode => {
  // TOOD: Handle array type here, items
  if (schema.properties) {
    const obj = new ObjectNode(schema, {}, isRequired); //{ data: {}}
    for (const [key, schem] of Object.entries(schema.properties)) {
      const required = schema.required?.findIndex((s) => s === key) !== -1;
      // Only keys are added as data of ObjectNode
      (obj.data as BaseNodes)[key] = populateChildren(schem, required);
    }
    return obj;
    // schema.additionalProperties.properties: check this here
  } else if (schema.additionalProperties) {
    const sampleData: BaseNodes = {};

    for (const [key, schem] of Object.entries(
      schema.additionalProperties.properties
    )) {
      const required =
        schema.additionalProperties.required?.findIndex((s) => s === key) !== -1;
      // Only keys are added as data of ObjectNode
      sampleData[key] = populateChildren(schem, required);
    }

    const obj = new AdditionalNode(schema, {}, false, sampleData);
    return obj;
  } else if (schema.items) {
    if (schema.items.properties) {
      // const sampleData: BaseNodes = {};
      const sampleData = new ObjectNode(schema, {}, isRequired);
      for (const [key, schem] of Object.entries(schema.items.properties)) {
        const required =
          schema.items.required?.findIndex((s) => s === key) !== -1;
        // Only keys are added as data of ObjectNode

        if (schem.items?.properties === schema.items.properties) {
          ((sampleData.data as BaseNodes)[key] as ArrayNode) = new ArrayNode(
            schema,
            [],
            false,
            sampleData
          );
        } else {
          (sampleData.data as BaseNodes)[key] = populateChildren(schem, required);
        }
      }
      const obj = new ArrayNode(schema, [], isRequired, sampleData);
      return obj;
    } else if (schema.additionalProperties) {
      const sampleData: BaseNodes = {};
      for (const [key, val] of Object.entries((schema.additionalProperties as ISchemaNode).properties)) {
        const required = (schema.additionalProperties  as ISchemaNode).required?.findIndex((s) => s === key) !== -1;
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
      const type = schema.items.type;
      const sampleData: BaseNode = {
        type: ParseType(type),
        data: getDefaultPrimitiveVal(type)
      }
      const obj = new ArrayNode(schema, [], false, sampleData);
      return obj;
    }
  } else {
    return getPrimitiveObject(schema, isRequired);
  }
};
