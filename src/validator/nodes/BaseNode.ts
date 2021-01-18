import { JsonConfigCommandCenter } from "../../core/JsonConfigCommandCenter";
import { DataType } from "../enum/DataType.enum";
import { ISchemaNode } from "../interfaces/ISchemaNode";
import { rootDataNode } from "../Validator";
import { StringNode } from "./StringNode";

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

export enum AssociationType {
  ALLOF, ONEOF, ANYOF, NOT, NONE
}

export class BaseNode {
  public type?: DataType;
  public nullable?: boolean;
  public description: string;
  public isRequired?: boolean;
  public association: AssociationType;
  public discriminator?: Discriminator;
  public example: any;
  public subSchemas: BaseNode[] = [];
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
    this._data = data;
    this.isRequired = isRequired;
    this.example = schema.example;
    this.nullable = schema.nullable;
    this.association = this.getAssociationType(schema);  
  }

  /**
   * Dicriminator:
   * This method returns a object as {key(discriminator type): values{object related to that type}}
   * But from CogniteJsonEditorOptions class, it dynamically get the type of json and replace this object with
   * correct object type
   */
  public get data(): IData {
    if (this.discriminator && this.discriminator.mapping ) {

      const result: BaseNodes = {};
      const keysForDiscriminatorTypes = Object.keys(this.discriminator.mapping);      

      for (const [key, val] of Object.entries(this.discriminator.mapping)) {
        const schemaPathSections = val.split("/");

        // Get node for specific type of dicriminator. It is the last section of the schemaPath array
        const stringKeyForType = schemaPathSections[schemaPathSections.length - 1];
        const nodeObjectForType = rootDataNode[stringKeyForType];

        if(nodeObjectForType && nodeObjectForType._data instanceof Object){
          const typeIndicatorProperty = (nodeObjectForType._data as BaseNodes)[this.discriminator.propertyName] as StringNode;
         
          // Change property values which are specific to discriminator type
          typeIndicatorProperty.data = key;
          typeIndicatorProperty.possibleValues = keysForDiscriminatorTypes;

          result[key] = nodeObjectForType;
        } else { 
          JsonConfigCommandCenter.schemaErrors.push(`Error occured while parsing schema. ${stringKeyForType} is not available`);
        }
      }
      /**
       * Example result:
       * {
       *    customHierarchy: { data: { type: {data: "customHierarchy", type: "string"}}... }
       *    fullAssetHierarchy: { data... }
       *    noHierarchy: { data... }
       * }
       */
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

  private getAssociationType(schema: ISchemaNode) {
    if(schema.allOf){
      return AssociationType.ALLOF;
    } 
    if(schema.oneOf){
      return AssociationType.ONEOF
    }
    if(schema.anyOf){
      return AssociationType.ANYOF;
    }
    if(schema.not){
      return AssociationType.NOT
    }
    return AssociationType.NONE;
  }
}
