import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class BooleanNode extends BaseNode {
    constructor(schema: ISchemaNode, data: IData, isRequired: boolean){
      super(DataType.boolean, schema, data, isRequired);
    }
  }