import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { BaseNode, IData } from "./BaseNode";

export class ObjectNode extends BaseNode {
    constructor(schema: ISchemaNode, data: IData, isRequired: boolean){
      super(DataType.object, schema, data, isRequired);
    }
  }