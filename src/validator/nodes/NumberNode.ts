import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class NumberNode extends BaseNode {
  public minimum: number | undefined;
  public maximum: number | undefined;

  constructor(schema: ISchemaNode, data: IData, isRequired: boolean) {
    super(DataType.number, schema, data, isRequired);
    this.minimum = schema.minimum;
    this.maximum = schema.maximum;
  }
}
