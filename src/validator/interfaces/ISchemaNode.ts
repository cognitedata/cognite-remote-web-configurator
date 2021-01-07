export interface ISchemaNode {
  description?: string;
  properties?: { [key: string]: any };

  // Type Related
  type: string;
  format?: string;
  nullable?: boolean // Nullable is not handled for now. Since users have to include only required values and if its null, that property can be removed.

  // Common Props
  example?: any;
  additionalProperties?: ISchemaNode;
  required?: string[];

  // Association Types
  allOf?: ISchemaNode[];
  anyOf?: ISchemaNode[];
  oneOf?: ISchemaNode[];
  not?: {
    type: string;
  };
  discriminator?: {
    mapping: { [key: string]: string };
    propertyName: string;
  };

  // StringNode
  enum?: string[];
  pattern?: string;
  maxLength?: number;

  // NumberNode
  minimum?: number;
  maximum?: number;

  // ArrayNode
  uniqueItems?: boolean;
  items?: ISchemaNode;
  minItems?: number;
  maxItems?: number;
}
