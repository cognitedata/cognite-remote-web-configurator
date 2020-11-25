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
  paths: (string | number)[]
): IValidationResult => {
  let resultNode = rootDataNode[group];

  for (const path of paths) {
    let next;
    if (typeof path === "number") {
      next = (resultNode.data as BaseNode[])[path];
    } else {
      next = (resultNode.data as BaseNodes)[path];
    }

    if (!next) {
      if (resultNode instanceof AdditionalNode) {
        next = resultNode.sampleData;
        resultNode.data = next.data;
        continue;
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
    resultNode = next as BaseNode;
  }

  const resultData = getJson(resultNode)
  return { group, resultNode, resultData };
};

// TODO: change return type to specific
export const getJson = (obj: BaseNode): any => {
  if (obj instanceof ObjectNode) {
    if (obj.data) {
      const dat: any = {};
      for (const [key, val] of Object.entries(obj.data)) {
        dat[key] = getJson(val);
      }
      return dat;
    }
  } else if (obj instanceof ArrayNode) {
    // temp add one item
    if (obj.minItems) {
      const dat: any = [];
      let sampleVal: any;

      if (obj.sampleData?.type === DataType.object) {
        sampleVal = {};
        for (const [key, val] of Object.entries(obj.sampleData?.data ?? "")) {
          sampleVal[key] = getJson(val as BaseNode);
        }
      } else {
        sampleVal = obj.sampleData?.data;
      }
      dat.push(sampleVal);
      return dat;
    } else {
      return [];
    }
  } else {
    switch (obj?.type) {
      case DataType.string:
        return "";
      case DataType.number:
        return 0;
      case DataType.boolean:
        return false;
      case DataType.object:
      case DataType.map:
        return {};
      case DataType.array:
        return [];

      default:
        return undefined;
    }
  }
  return undefined;
};
