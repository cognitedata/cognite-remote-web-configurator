import { ErrorType, IValidationResult } from "../interfaces/IValidationResult";
import { BaseNode, IDataNodeMap } from "../nodes/BaseNode";

export const getNode = (rootDataNode: BaseNode, 
    paths: { isArray: boolean; val: string | number }[]
  ): IValidationResult => {
    let resultNode = { ...rootDataNode };
  
    for (const path of paths) {
      let next;
      if (path.isArray) {
        next = (resultNode.data as BaseNode[])[path.val as number];
      } else {
        next = (resultNode.data as IDataNodeMap)[path.val as string];
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
  