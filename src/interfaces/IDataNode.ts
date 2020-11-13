export enum DataType {
  unspecified = "unspecified",
  string = "string",
  number = "number",
  boolean = "boolean",
  object = "object",
  array = "array",
}

export type IDataNodeMap = { [key: string]: DataNode };
export type IDataType = IDataNodeMap | DataNode[] | string | number | boolean
// export interface IDataNode {
//   data: IDataNodeMap | IDataNode[] | string | number | boolean;
//   type: DataType;
//   description: string;
//   isRequired?: boolean;
// }

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
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.string, description, data, isRequired);
  }
}

export class NumberNode extends DataNode {
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.number, description, data, isRequired);
  }
}

export class ArrayNode extends DataNode {
  constructor(description: string, data: IDataType, isRequired: boolean){
    super(DataType.array, description, data, isRequired);
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