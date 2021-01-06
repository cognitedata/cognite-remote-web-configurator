export interface ISchemaNode {
  properties?: { [key: string]: any };
  type: string;
  description?: string;

  // Common Props
  additionalProperties?: ISchemaNode;
  required?: string[];
  minItems?: number;
  maxItems?: number;
  items?: ISchemaNode;
  format?: string;
  enum?: string[];
  discriminator?: {
    mapping: { [key: string]: string };
    propertyName: string;
  };
  allOf?: ISchemaNode[];
  anyOf?: ISchemaNode[];
  oneOf?: ISchemaNode[];
  not?: {
    type: string;
  };
  example?: any;

  // StringNode
  pattern?: string;
  maxLength?: number;

  // NumberNode
  minimum?: number;
  maximum?: number;
}
