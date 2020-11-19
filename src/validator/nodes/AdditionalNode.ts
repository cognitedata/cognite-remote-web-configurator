import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, BaseNodes, IData } from "./BaseNode";

export class AdditionalNode extends BaseNode {
    public sampleData: BaseNodes;
    constructor(schema: ISchemaNode, data: IData, isRequired: boolean, sampleData: BaseNodes){
      super(DataType.object, schema, data, isRequired);
      this.sampleData = sampleData;
    }
  }