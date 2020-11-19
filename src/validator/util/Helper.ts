import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { AdditionalNode } from "../nodes/AdditionalNode";
import { BaseNode, BaseNodes, IData } from "../nodes/BaseNode";

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
        next =  resultNode.sampleData;
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
