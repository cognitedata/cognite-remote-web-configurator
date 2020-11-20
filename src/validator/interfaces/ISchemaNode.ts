export interface ISchemaNode {
  properties: {[key: string]: any};
  additionalProperties?: ISchemaNode;
  type: string;
  description: string;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  items?: ISchemaNode;
  format?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
}