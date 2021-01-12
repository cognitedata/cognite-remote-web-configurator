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

const addedRefs: any = {};

const getPrimitiveObject = (schema: ISchemaNode, isRequired: boolean) => {
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

  } else if (schema.allOf || schema.anyOf) {
    const associatedSchema = schema.allOf || schema.anyOf;
    const obj = new ObjectNode(schema, {}, isRequired);

    let dat: any = {};

    if(associatedSchema){
      for (const subSchema of associatedSchema) {
        const children = populateChildren(subSchema, isRequired);
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
      (obj.rowData as BaseNodes)[key] = populateChildren(subSchema, required);
      
      // If sample data is already created, then use previously created one(avoid circular loops)
      addedRefs[obj.description]= (obj.rowData as BaseNodes)[key];
    }
    return obj;
  } else if (schema.additionalProperties) { 
    // If sample data is already created, then use previously created one(avoid circular loops)
    if (schema.additionalProperties.description && addedRefs[schema.additionalProperties.description]) {
      const obj = new MapNode(schema, {}, false, addedRefs[schema.additionalProperties.description]);
      return obj;
    } else {
      const obj = new MapNode(schema, {}, false, undefined);
      obj.sampleData = populateChildren(schema.additionalProperties, false);
      addedRefs[obj.sampleData.description]= obj.sampleData; 
      return obj;
    }
  } else if (schema.items) {
    // If sample data is already created, then use previously created one(avoid circular loops)
    if (schema.items.description && addedRefs[schema.items.description]) {
      const obj = new ArrayNode(
        { type: DataType.array, description: schema.description },
        [],
        isRequired,
        addedRefs[schema.items.description]
      );
      return obj;
    } else {
      const obj = new ArrayNode(schema, [], isRequired, undefined);
      obj.sampleData = populateChildren(schema.items, false);
      addedRefs[obj.sampleData.description]= obj.sampleData; 
      return obj;
    }
  } else {
    return getPrimitiveObject(schema, isRequired);
  }
};
