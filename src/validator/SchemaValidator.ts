import { JsonConfigCommandCenter } from "../core/JsonConfigCommandCenter";
import { ISchemaNode } from "./interfaces/ISchemaNode";

export class SchemaValidator {
  public static validateUnresolvedSchema(unresolvedSchema: ISchemaNode) {
    for (const val of Object.values(unresolvedSchema)) {
      const schemaNode = val as ISchemaNode;

      if (schemaNode.properties) {
        this.checkProperties(schemaNode);
      }

      if (schemaNode.allOf) {
        for (const val of schemaNode.allOf) {
          this.checkProperties(val);
        }
      }

      if (schemaNode.oneOf) {
        for (const val of schemaNode.oneOf) {
          this.checkProperties(val);
        }
      }
    }
  }

  private static checkProperties(schemaNode: ISchemaNode) {
    if (schemaNode.properties) {
      for (const val of Object.values(schemaNode.properties)) {
        if (val.properties) {
          JsonConfigCommandCenter.schemaErrors.push(
            `Nested types should comes with a ref: ${val.description}`
          );
        }
        if (val.additionalProperties && !val.additionalProperties.$ref) {
          JsonConfigCommandCenter.schemaErrors.push(
            `additionalProperties should have a ref: ${val.description}`
          );
        }
        if (val.items && val.items.properties) {
          JsonConfigCommandCenter.schemaErrors.push(
            `items of an object array should have a ref: ${val.description}`
          );
        }
      }
    }
  }
}
