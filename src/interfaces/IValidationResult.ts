import { BaseNode } from "../nodes/BaseNode";

export enum ErrorType {
    InvalidPath
}

export interface IValidationError {
    type: ErrorType;
    text?: string;
}

export interface IValidationResult {
    resultNode: BaseNode | null;
    error?: IValidationError;
}