import { DataType } from "../enum/DataType.enum";
import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { AdditionalNode } from "../nodes/AdditionalNode";
import { BaseNode, BaseNodes, IData } from "../nodes/BaseNode";
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
  if (obj.data && obj.type === DataType.object) {
    const dat: any = {};
    for (const [key, val] of Object.entries(obj.data)) {
      dat[key] = getJson(val);
    }
    return dat;
  } else {
    switch (obj.type) {
      case DataType.array:
        return [];
      case DataType.string:
        return obj.data;

      default:
        return undefined;
    }
  }
};
