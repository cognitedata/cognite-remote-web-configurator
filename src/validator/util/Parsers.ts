import { DataFormat } from "../enum/DataFormat.enum";
import { DataType } from "../enum/DataType.enum";

export const ParseType = (type: string): DataType => {
  switch (type) {
    case "string":
      return DataType.string;
    case "number":
    case "integer":
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

export const getDefaultPrimitiveVal = (type: string): any => {
  switch (type) {
    case "string":
      return '';
    case "number":
    case "integer":
      return 0;
    case "object":
      return {};
    case "boolean":
      return false;
    case "array":
      return [];
    default:
      return undefined;
  }
};

export const ParseFormat = (format: string): DataFormat => {
  switch (format) {
    case "int32":
      return DataFormat.int32;
    case "int64":
      return DataFormat.int64;
    case "double":
      return DataFormat.double;
    case "float":
      return DataFormat.float;
    default:
      return DataFormat.unspecified;
  }
};
