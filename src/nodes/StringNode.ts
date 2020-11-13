import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class StringNode extends BaseNode {
  public possibleValues: string[] | undefined;

  constructor(schema: ISchemaNode, data: IData, isRequired: boolean) {
    super(DataType.string, schema.description, data, isRequired);
    if (schema.enum) {
      this.possibleValues = schema.enum;
      this.data = schema.enum[0];
    }
  }
}
