export enum DataType {
  unspecified = "unspecified",
  string = "string",
  number = "number",
  boolean = "boolean",
  object = "object",
  array = "array",
}

export type IDataNodeMap = { [key: string]: IDataNode };
export interface IDataNode {
  data: IDataNodeMap | IDataNode[] |string | number | boolean
  // value?: ;
  type: DataType;
  isRequired?: boolean;
}
