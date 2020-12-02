export interface ISchemaNode {
  properties?: {[key: string]: any};
  type: string;
  description?: string;

  // optional props
  additionalProperties?: ISchemaNode;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  items?: ISchemaNode;
  format?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  discriminator?: {
    mapping: {[key: string]: string};
    propertyName: string;
  }
  allOf?: ISchemaNode[];
}
