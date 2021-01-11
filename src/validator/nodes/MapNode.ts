import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class MapNode extends BaseNode {
  public sampleData: BaseNode | undefined;
  public minProperties: number | undefined;
  public maxProperties: number | undefined;

  constructor(
    schema: ISchemaNode,
    data: IData,
    isRequired: boolean,
    sampleData: BaseNode | undefined
  ) {
    super(DataType.map, schema, data, isRequired);
    this.sampleData = sampleData;
    this.minProperties = schema.minProperties;
    this.maxProperties = schema.maxProperties;
  }
}
