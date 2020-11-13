import { DataType } from "../enum/DataType.enum";
import { populateChildren } from "../util/NodeFactory";
import { ISchemaNode } from "./ISchemaNode";

export type IDataNodeMap = { [key: string]: DataNode };
export type IDataType = IDataNodeMap | DataNode[] | string | number | boolean

export class DataNode {
  public type: DataType;
  public description: string;
  public data: IDataType;
  public isRequired: boolean;

  constructor(type: DataType, description: string, data: IDataType, isRequired: boolean){
    this.type = type;
    this.description = description;
    this.data = data;
    this.isRequired = isRequired;
  }
}

export class StringNode extends DataNode {
  public possibleValues: string[] = [];
  constructor(schema: ISchemaNode, data: IDataType, isRequired: boolean){
    super(DataType.string, schema.description, data, isRequired);
    if(schema.enum){
      this.possibleValues = schema.enum;
      this.data = schema.enum[0];
    }
  }
}

export class NumberNode extends DataNode {
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.number, description, data, isRequired);
  }
}

export class ArrayNode extends DataNode {
  public minItems: number | undefined;
  public maxItems: number | undefined;

  constructor(schema: ISchemaNode, isRequired: boolean){
    super(DataType.array, schema.description, [], isRequired);
    this.minItems = schema.minItems;
    this.maxItems = schema.maxItems;

    if(this.minItems > 0){
      for(let i = 0; i< this.minItems; i++){
        (this.data as DataNode[]).push(populateChildren(schema.items, true))
      }
    }
  }
}

export class BooleanNode extends DataNode {
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.boolean, description, data, isRequired);
  }
}

export class ObjectNode extends DataNode {
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.object, description, data, isRequired);
  }
}