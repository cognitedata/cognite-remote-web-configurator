import { DataType } from "../enum/DataType.enum";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { MapNode } from "../nodes/MapNode";
import { ArrayNode } from "../nodes/ArrayNode";
import { BaseNode, BaseNodes } from "../nodes/BaseNode";
import { ObjectNode } from "../nodes/ObjectNode";

export const removeDataNode = (
  data: Record<string, unknown>,
  paths: (string | number)[]
): Record<string, unknown> => {
  const obj: any = { ...data };
  let next = obj;
  for (let i = 0; i < paths.length; i++) {
    if (i === paths.length - 1) {
      delete next[paths[i]];
      break;
    }
    next = next[paths[i]];
  }
  return obj;
};

export const getNodeInstance = (
  group: string,
  rootDataNode: BaseNodes,
  rootJsonNode: any,
  paths: (string | number)[]
): IValidationResult => {
  let resultNode: BaseNode|undefined = rootDataNode[group];
  let json = rootJsonNode;
  // let nextResultNode;

  for (const path of paths) {  
    // Looping through node path

    if (resultNode) {
      // If discriminator, then get the relevant type
      if(resultNode.discriminator && resultNode.data){
        let nextResultNodeTypeFromData;
        if(json){
          //Try to obtain discriminator type from currentJson
          const subTypeInData: any = json[resultNode.discriminator.propertyName];
          nextResultNodeTypeFromData = (resultNode.data as BaseNodes)[subTypeInData];
        }
        resultNode = nextResultNodeTypeFromData ?? Object.values(resultNode.data)[0];
      }
    
      // If AdditionalNode/ArrayNode, then get the nextNode from sample data
      if (resultNode instanceof MapNode || resultNode instanceof ArrayNode) {
        resultNode = resultNode.sampleData;
      } else {
      // Get the nextNode from path
        resultNode = (resultNode?.data as BaseNodes)[path]; 
      }
      
      if (!resultNode) {
        return {
          group,
          resultNode: null,
          error: {
            type: ErrorType.InvalidPath,
          },
        };
      }
    }

    if(json){
      json = json[path];
    }
  }

  const resultData = getJson(resultNode);
  return { group, resultNode, resultData };
};

const getPrimitiveValue = (obj: BaseNode | undefined) => {
  switch (obj?.type) {
    case DataType.string:
      return obj.data ?? "";
    case DataType.number:
      return obj.data ?? 0;
    case DataType.boolean:
      return obj.data ?? false;
    case DataType.object:
    case DataType.map:
      return obj.data ?? {};
    case DataType.array:
      return obj.data ?? [];

    default:
      return undefined;
  }
};

export const getJson = (obj: BaseNode | undefined, fillAllFields = false): any => {
  /**
   * If example json value found, then just return the provided example.
   */
  if(obj?.example){
    return obj.example;
  }

  if (obj instanceof ObjectNode) {
   if (obj.data) {
      const dat: any = {};
      for (const [key, val] of Object.entries(obj.data)) {
        const valNode = val as BaseNode;
        if(!valNode.discriminator && (valNode.isRequired || fillAllFields)){
          dat[key] = getJson(val);
        }
      }
      return dat;
    } else {
      return getPrimitiveValue(obj);
    }
  } else if (obj instanceof ArrayNode) {
    if (obj.minItems) {
      const dat: any = [];
      // No need to handle discriminator types since they are optional
      if(!obj.sampleData?.discriminator){
        const sampleVal = getJson(obj.sampleData);

        for (let i = 0; i < obj.minItems; i++) {
          dat.push(sampleVal);
        }
      }
      return dat;
    } else {
      return [];
    }
  } // No need to handle MapNodes, since they are optional always 
  else {
    return getPrimitiveValue(obj);
  }
};
