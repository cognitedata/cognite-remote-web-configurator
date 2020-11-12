export enum DataType {
  unspecified,
  string,
  number,
  boolean,
  object,
}

export interface IDataNode {
  [key: string]: unknown;
  metaType: DataType;
}
