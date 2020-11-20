import { BaseNode } from "../nodes/BaseNode";

export enum ErrorType {
    InvalidPath = 'InvalidPath',
    RequiredNode = 'RequiredNode',
}

export interface IValidationError {
    type: ErrorType;
    text?: string;
}

export interface IValidationResult {
    resultNode?: BaseNode | null;           // Affected node with meta data
    resultData?: Record<string, unknown>    // Full result json after changes are affected
    error?: IValidationError;               // If error occured
}