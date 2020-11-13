import { DataType } from "../enum/DataType.enum";
import { BaseNode, IData } from "./BaseNode";

export class BooleanNode extends BaseNode {
    constructor(description: string, data: IData, isRequired: boolean){
      super(DataType.boolean, description, data, isRequired);
    }
  }