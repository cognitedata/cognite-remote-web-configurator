import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class StringNode extends BaseNode {
  public possibleValues: string[] | undefined;

  constructor(schema: ISchemaNode, data: IData, isRequired: boolean) {
    super(DataType.string, schema, data, isRequired);
    if (schema.enum) {
      this.possibleValues = schema.enum;
    }
    // If example exists, it will be handled by BaseNode
    if(!schema.example && this.possibleValues){    
      this.data = this.possibleValues[0];
    }
  }
}
