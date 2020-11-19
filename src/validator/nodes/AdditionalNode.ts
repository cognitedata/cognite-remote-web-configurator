import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class AdditionalNode extends BaseNode {
    public sampleData: IData;
    constructor(schema: ISchemaNode, data: IData, isRequired: boolean, sampleData: IData){
      super(DataType.object, schema, data, isRequired);
      this.sampleData = sampleData;
    }
  }