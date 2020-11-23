import { DataType } from "../enum/DataType.enum";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { AdditionalNode } from "../nodes/AdditionalNode";
import { ArrayNode } from "../nodes/ArrayNode";
import { BaseNode, BaseNodes, IData } from "../nodes/BaseNode";
import { ObjectNode } from "../nodes/ObjectNode";
import { StringNode } from "../nodes/StringNode";

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
  rootDataNode: BaseNode,
  paths: (string | number)[]
): IValidationResult => {
  let resultNode = { ...rootDataNode };

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
        resultNode.data = next as IData;
        continue;
      } else {
        return {
          resultNode: null,
          error: {
            type: ErrorType.InvalidPath,
          },
        };
      }
    }
    resultNode = next as BaseNode;
  }
  return { resultNode };
};

export const getJson = (obj: BaseNode) => {
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
      if (obj.sampleData) {
        const dat: any = {};
        for (const [key, val] of Object.entries(obj.sampleData)) {
          dat[key] = getJson(val);
        }
        return [dat];
      } else {
        return ["NO sample"];
      }
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
