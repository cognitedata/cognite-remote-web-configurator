export interface ISchemaNode {
  properties: {[key: string]: any};
  type: string;
  required: string[];
  description: string;
  minItems: number;
  maxItems: number;
  items: ISchemaNode;
  format: string;
  enum: string[];
}
