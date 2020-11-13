import { DataType } from "../enum/DataType.enum";

export type IDataNodeMap = { [key: string]: BaseNode };
export type IData = IDataNodeMap | BaseNode[] | string | number | boolean;

export class BaseNode {
    public type: DataType;
    public description: string;
    public data: IData;
    public isRequired: boolean;
  
    constructor(type: DataType, description: string, data: IData, isRequired: boolean){
      this.type = type;
      this.description = description;
      this.data = data;
      this.isRequired = isRequired;
    }
  }