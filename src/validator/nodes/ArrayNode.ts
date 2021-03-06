import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class ArrayNode extends BaseNode {
  public minItems?: number | undefined;
  public maxItems?: number | undefined;
  public sampleData: BaseNode | undefined;
  public uniqueItems: boolean | undefined;

  constructor(schema: ISchemaNode, data: IData, isRequired: boolean, sampleData?: BaseNode) {
    super(DataType.array, schema, [], isRequired);
    this.minItems = schema.minItems;
    this.maxItems = schema.maxItems;
    this._data = data;
    this.sampleData = sampleData;
    this.uniqueItems = schema.uniqueItems;
  }
}
