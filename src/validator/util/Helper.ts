import { DataType } from "../enum/DataType.enum";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { AdditionalNode } from "../nodes/AdditionalNode";
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

export const getNode = (
  group: string,
  rootDataNode: BaseNodes,
  rootJsonNode: any,
  paths: (string | number)[]
): IValidationResult => {
  let resultNode = rootDataNode[group];
  let json = rootJsonNode;
  let nextResultNode;

  for (const path of paths) {  
    // Looping through node path

    if (resultNode) {
      // If discriminator, then get the relevant type from there
      if(resultNode.discriminator && resultNode.data){
        let nextResultNodeTypeFromData;
        if(json){
          //Try to get discriminator type from currentJson
          const subTypeInData = json[resultNode.discriminator.propertyName];
          nextResultNodeTypeFromData = (resultNode.data as BaseNodes)[subTypeInData];
        }
        resultNode = nextResultNodeTypeFromData ?? Object.values(resultNode.data)[0];
      }
      nextResultNode = (resultNode.data as BaseNodes)[path];
    }

    if(json){
      json = json[path];
    }

    if (!nextResultNode) {
      if (resultNode instanceof AdditionalNode || resultNode instanceof ArrayNode) {
        nextResultNode = resultNode.sampleData;
      } else {
        return {
          group,
          resultNode: null,
          error: {
            type: ErrorType.InvalidPath,
          },
        };
      }
    }
    resultNode = nextResultNode as BaseNode;
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

export const getJson = (obj: BaseNode | undefined): any => {
  if (obj instanceof ObjectNode) {
   if (obj.data) {
      const dat: any = {};
      for (const [key, val] of Object.entries(obj.data)) {
        if(!(val as BaseNode).discriminator){
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
