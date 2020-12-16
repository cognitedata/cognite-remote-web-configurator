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

const getPrimitiveObject = (schema: ISchemaNode, isRequired: boolean) => {
  if (!schema) {
    return new BaseNode(
      DataType.unspecified,
      { type: DataType.unspecified },
      undefined,
      isRequired
    );
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
  isRequired: boolean,
  parentSchema: ISchemaNode
): BaseNode => {
  if (schema.allOf) {
    const obj = new ObjectNode(schema, {}, isRequired);
    let dat: any = {};
    for (const schema1 of schema.allOf) {
      const children = populateChildren(schema1, isRequired, schema);
      if(children.rowData instanceof Object){
        dat = { ...dat, ...children.rowData};
      }
    }
    obj.data = dat;
    return obj;
  } else if (schema.properties) {
    const obj = new ObjectNode(schema, {}, isRequired);
    for (const [key, schem] of Object.entries(schema.properties)) {
      const required = schema.required
        ? schema.required.findIndex((s) => s === key) !== -1
        : false;
      // Since `{}` is passed as data for obj, type can be BaseNodes
      (obj.rowData as BaseNodes)[key] = populateChildren(schem, required, schema);
    }
    return obj;
  } else if (schema.additionalProperties) {
    const sampleData = populateChildren(
      schema.additionalProperties,
      false,
      schema
    );
    const obj = new AdditionalNode(schema, {}, false, sampleData);
    return obj;
  } else if (schema.items) {
    if (schema.items === parentSchema) {
      const sampleData = new BaseNode(
        DataType.unspecified,
        { type: DataType.unspecified },
        {},
        isRequired
      );
      // TODO: fix circular issue here
      const obj = new ArrayNode(
        { type: DataType.array },
        [],
        isRequired,
        sampleData
      );
      return obj;
    } else {
      const sampleData = populateChildren(schema.items, false, schema);
      const obj = new ArrayNode(schema, [], isRequired, sampleData);
      return obj;
    }
  } else {
    return getPrimitiveObject(schema, isRequired);
  }
};
