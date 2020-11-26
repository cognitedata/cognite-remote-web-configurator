import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class AdditionalNode extends BaseNode {
    public sampleData: BaseNode;
    
    constructor(schema: ISchemaNode, data: IData, isRequired: boolean, sampleData: BaseNode){
      super(DataType.map, schema, data, isRequired);
      this.sampleData = sampleData;
    }
  }