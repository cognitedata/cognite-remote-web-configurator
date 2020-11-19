import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { BaseNode, BaseNodes } from "../nodes/BaseNode";

export const getNode = (rootDataNode: BaseNode, 
    paths: (string | number)[]
  ): IValidationResult => {
    let resultNode = { ...rootDataNode };
  
    for (const path of paths) {
      let next;
      if (typeof(path) === 'number') {
        next = (resultNode.data as BaseNode[])[path];
      } else {
        next = (resultNode.data as BaseNodes)[path];
      }
      
      if (!next) {
        return {
          resultNode: null,
          error: {
            type: ErrorType.InvalidPath,
          },
        };
      }
      resultNode = next;
    }
    return { resultNode };
  };
  