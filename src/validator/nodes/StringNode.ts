import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class StringNode extends BaseNode {
  public possibleValues: string[] | undefined;
  public maxLength: number | undefined;
  public pattern: string | undefined;

  constructor(schema: ISchemaNode, data: IData, isRequired: boolean) {
    super(DataType.string, schema, data, isRequired);
    this.maxLength = schema.maxLength;
    this.pattern = schema.pattern;
    if (schema.enum) {
      this.possibleValues = schema.enum;
    }
  }
}
