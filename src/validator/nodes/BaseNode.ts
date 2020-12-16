import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { rootDataNode } from "../Validator";

export type BaseNodes = { [key: string]: BaseNode };
export type IData =
  | BaseNodes
  | BaseNode[]
  | string
  | number
  | boolean
  | undefined;
export type Discriminator = {
  mapping: { [key: string]: string };
  propertyName: string;
};

export class BaseNode {
  public type?: DataType;
  public description?: string;
  public isRequired?: boolean;
  public discriminator?: Discriminator;

  protected _data: IData;

  constructor(
    type: DataType,
    schema: ISchemaNode,
    data: IData,
    isRequired: boolean
  ) {
    this.type = type;
    this.description = schema.description;
    this.discriminator = schema.discriminator;
    /**
     * This rule overrides the data comes from constructor.
     * But this is ok for now since we are using these logics for creating template nodes.
     */
    this._data = schema.example ?? data;
    this.isRequired = isRequired;
  }

  public get data(): IData {
    if (this.discriminator) {
      const result: BaseNodes = {};
      const possibleTypeValues = Object.keys(this.discriminator.mapping);      

      for (const [key, val] of Object.entries(this.discriminator.mapping)) {
        const schemaPath = val.split("/");
        const node = rootDataNode[schemaPath[schemaPath.length - 1]];

        if(node._data instanceof Object){
          // TODO: avoid any type.
          // TODO: create StringNode here.
          (node._data as any)[this.discriminator.propertyName] = {
            type: 'string',
            data: key,
            possibleValues: possibleTypeValues
          };
        }
        result[key] = node;
      }
      return result;
    } else {
      return this._data;
    }
  }

  public set data(data: IData) {
    this._data = data;
  }

  public get rowData(): IData {
    return this._data;
  }
}
