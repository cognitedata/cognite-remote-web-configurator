import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";

export type BaseNodes = { [key: string]: BaseNode };
export type IData = BaseNodes | BaseNode[] | string | number | boolean | undefined;

export class BaseNode {
  public type?: DataType;
  public description?: string;
  public data: IData;
  public isRequired?: boolean;

  constructor(type: DataType, schema: ISchemaNode, data: IData, isRequired: boolean) {
    this.type = type;
    this.description = schema.description;
    // This rule overrides the data comes from constructor. But this is ok for now since we are using these logics for creating taplate nodes.
    this.data = schema.example ?? data;
    this.isRequired = isRequired;
  }
}
