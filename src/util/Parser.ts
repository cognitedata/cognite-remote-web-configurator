import { DataType } from "../interfaces/IDataNode";

export const ParseType = (type: string): DataType => {
  switch (type) {
    case "string":
      return DataType.string;
    case "number":
      return DataType.number;
    case "object":
      return DataType.object;
    case "boolean":
      return DataType.boolean;
    case "array":
      return DataType.array;

    default:
      return DataType.unspecified;
  }
};
