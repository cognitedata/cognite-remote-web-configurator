import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { MapNode } from "../nodes/MapNode";
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
  parentSchema: ISchemaNode,
  parentBaseNode: BaseNode 
): BaseNode => {
  if (schema.oneOf) {
    // schema.oneOf is handled only if discriminator presents in schma,(Check BaseNode `get data` implementation)
    return new BaseNode(DataType.object, schema, {}, isRequired);

  } else if (schema.allOf || schema.anyOf) {
    const associatedSchema = schema.allOf || schema.anyOf;
    const obj = new ObjectNode(schema, {}, isRequired);

    let dat: any = {};

    if(associatedSchema){
      for (const subSchema of associatedSchema) {
        const children = populateChildren(subSchema, isRequired, schema, obj);
        obj.subSchemas.push(children);
        if(children.rowData instanceof Object){
          dat = { ...dat, ...children.rowData};
        }
      }
    }

    obj.data = dat;
    return obj;

  } else if (schema.properties) {
    const obj = new ObjectNode(schema, {}, isRequired);
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      const required = schema.required
        ? schema.required.findIndex((s) => s === key) !== -1
        : false;
      // Since `{}` is passed as data for obj, type can be BaseNodes
      (obj.rowData as BaseNodes)[key] = populateChildren(subSchema, required, schema, obj);
    }
    return obj;
  } else if (schema.additionalProperties) { 
    const obj = new MapNode(schema, {}, false, undefined);
    const sampleData = populateChildren(
      schema.additionalProperties,
      false,
      schema,
      obj
    );
    obj.sampleData = sampleData;
    return obj;
  } else if (schema.items) {
    if (schema.items === parentSchema) {
      const obj = new ArrayNode(
        { type: DataType.array },
        [],
        isRequired,
        parentBaseNode
      );
      return obj;
    } else {
      const obj = new ArrayNode(schema, [], isRequired, undefined);
      obj.sampleData = populateChildren(schema.items, false, schema, obj);
      
      return obj;
    }
  } else {
    return getPrimitiveObject(schema, isRequired);
  }
};
