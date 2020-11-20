import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";

export type BaseNodes = { [key: string]: BaseNode };
export type IData = BaseNodes | BaseNode[] | string | number | boolean;

export class BaseNode {
    public type?: DataType;
    public description?: string;
    public data: IData;
    public isRequired?: boolean;
  
    constructor(type: DataType,schema: ISchemaNode, data: IData, isRequired: boolean){
      this.type = type;
      this.description = schema.description;
      this.data = data;
      this.isRequired = isRequired;
    }
  }