import { DataType, IDataNode } from "./IDataNode";
import YAML from "yamljs";
import ymlFile from "./twinconfig.yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { ISchemaNode } from "./ISchemaNode";

const createSample = (schema: ISchemaNode): IDataNode => {
    const obj: IDataNode = {
        metaType: DataType.unspecified
    };
    if (schema.properties) {
      for (const [key, val] of Object.entries(schema.properties)) {
        obj[key] = createSample( val);
      }
      return obj;
    } else {
      obj.leaf = true;
      // switch(schema.type){
        
      // }
      obj.meta = schema.type;
      return obj;
    }
  }

export const populateTemplate = (): void => {
    YAML.load(ymlFile, (ymlJson: any) => {
        SwaggerParser.validate(ymlJson, (err, api) => {
          if (err) {
            console.error(err);
          } else {
            console.log(
              "----------------------------------",
              api.info.title,
              api.info.version
            );
            const schema = api.components.schemas;
            console.log(schema);
            console.log("----------------------------------");
  
            const root: any = {};
            for (const [key2,val2] of Object.entries(schema)) {
              root[key2] =  createSample(val2 as ISchemaNode);
            }
  
            // console.log(createSample(schema.TwinConfiguration));
  
            // console.log('schema ', Object.entries(schema).length);
            // console.log('root ', Object.entries(root).length)
            console.log(root);
          }
        });
      });
}