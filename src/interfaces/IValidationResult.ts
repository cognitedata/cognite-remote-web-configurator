import { IDataNode } from "./IDataNode";

export enum ErrorType {
    InvalidPath
}

export interface IValidationError {
    type: ErrorType;
    text?: string;
}

export interface IValidationResult {
    resultNode: IDataNode | null;
    error?: IValidationError;
}