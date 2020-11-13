import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { populateChildren } from "../util/NodeFactory";
import { BaseNode } from "./BaseNode";

export class ArrayNode extends BaseNode {
    public minItems: number | undefined;
    public maxItems: number | undefined;
  
    constructor(schema: ISchemaNode, isRequired: boolean){
      super(DataType.array, schema.description, [], isRequired);
      this.minItems = schema.minItems;
      this.maxItems = schema.maxItems;
  
      if(this.minItems > 0){
        for(let i = 0; i< this.minItems; i++){
          (this.data as BaseNode[]).push(populateChildren(schema.items, true))
        }
      }
    }
  }