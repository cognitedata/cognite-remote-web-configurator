import { DataNode } from "./IDataNode";

export enum ErrorType {
    InvalidPath
}

export interface IValidationError {
    type: ErrorType;
    text?: string;
}

export interface IValidationResult {
    resultNode: DataNode | null;
    error?: IValidationError;
}