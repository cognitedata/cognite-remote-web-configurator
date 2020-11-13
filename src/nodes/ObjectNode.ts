import { DataType } from "../enum/DataType.enum";
import { BaseNode, IData } from "./BaseNode";

export class ObjectNode extends BaseNode {
    constructor(description: string, data: IData, isRequired: boolean){
      super(DataType.object, description, data, isRequired);
    }
  }