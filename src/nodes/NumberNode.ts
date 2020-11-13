import { DataType } from "../enum/DataType.enum";
import { BaseNode, IData } from "./BaseNode";

export class NumberNode extends BaseNode {
    constructor(description: string, data: IData, isRequired: boolean){
      super(DataType.number, description, data, isRequired);
    }
  }