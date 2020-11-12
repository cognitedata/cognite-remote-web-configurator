export enum DataType {
  unspecified = 'unspecified',
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object',
}

export interface IDataNode {
  data: {[key: string]: IDataNode};
  type: DataType;
}
