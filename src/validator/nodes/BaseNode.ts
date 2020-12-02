import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { rootDataNode } from "../Validator";

export type BaseNodes = { [key: string]: BaseNode };
export type IData = BaseNodes | BaseNode[] | string | number | boolean | undefined;
export type Discriminator = {
  mapping: {[key: string]: string};
  propertyName: string;
}

export class BaseNode {
  public type?: DataType;
  public description?: string;
  public _data: IData;
  public isRequired?: boolean;
  public discriminator?: Discriminator;

  constructor(type: DataType, schema: ISchemaNode, data: IData, isRequired: boolean) {
    this.type = type;
    this.description = schema.description;
    this.discriminator = schema.discriminator;
    this._data = data;
    this.isRequired = isRequired;
  }

  public get data(): IData{
    if(this.discriminator){
      const result: any = {};

      for(const [key, val] of Object.entries(this.discriminator.mapping)){
        const schemaPath = val.split('/');
        result[key] = rootDataNode[schemaPath[schemaPath.length - 1]];
      }
      return result;
    } else{
      return this._data;
    }
  }
}
