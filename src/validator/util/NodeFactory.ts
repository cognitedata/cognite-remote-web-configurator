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

// To store previously populated children to avoid circular cycles 
const addedRefs: any = {};

const getPrimitiveObject = (schema: ISchemaNode, isRequired: boolean) => {
  if(schema.additionalProperties){
    return new MapNode(schema, {}, isRequired, undefined);
  } else if(schema.items){
    return new ArrayNode(schema, [], isRequired);
  }
  // TODO: why map type is not handled here
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
      return new BaseNode(DataType.any, schema, {}, isRequired);
  }
};

export const populateChildren = (
  schema: ISchemaNode,
  isRequired: boolean
): BaseNode => {
  if (schema.not) {
    return new BaseNode(ParseType(schema.not.type), schema, {}, isRequired);

  } else if (schema.oneOf) {
    // schema.oneOf is handled only if discriminator presents at schma,(Check BaseNode `get data()` implementation)
    return new BaseNode(DataType.object, schema, {}, isRequired);

  } else if (schema.allOf) {
    const obj = new ObjectNode(schema, {}, isRequired);
    let dat: any = {};

    for (const subSchema of schema.allOf) {
      const children = populateChildren(subSchema, isRequired);
      if(children.rowData instanceof Object){
        dat = { ...dat, ...children.rowData};
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
      
      let children: any = getPrimitiveObject(subSchema, required);

      // If these children are previousy generated the used the cached one
      if(subSchema.description && addedRefs[subSchema.description]){
        children = addedRefs[subSchema.description];
      } else {
        addedRefs[subSchema.description] = children;
        Object.assign(children, populateChildren(subSchema, required));   
      }
      // Since `{}` is passed as data for obj, type can be BaseNodes
      (obj.rowData as BaseNodes)[key] = children;
    }
    return obj;
  } else if (schema.additionalProperties) {
      const obj = new MapNode(schema, {}, false, undefined);
      obj.sampleData = populateChildren(schema.additionalProperties, false); 
      return obj;
  } else if (schema.items) {
      const obj = new ArrayNode(schema, [], isRequired, undefined);
      obj.sampleData = populateChildren(schema.items, false);
      return obj;
  } else {
    return getPrimitiveObject(schema, isRequired);
  }
};
