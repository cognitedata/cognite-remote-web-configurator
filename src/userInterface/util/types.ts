import { JSONEditorOptions } from "jsoneditor";
import { MergeModes } from "./enums/MergeModes";

export interface JsonConfig {
    id: number | null;
    data: JsonPayLoad
}

export interface JsonPayLoad {
    assets?: any[];
    header: {
        name: string;
        type: string;
    }
}

export interface MergeOptions {
    originalConfig: any;
    editedConfig: any;
    diffMode: MergeModes;
    onOk: (mergedJson: any) => void;
    onCancel: () => void;
}

export interface JsonEditorOptions extends JSONEditorOptions {
    limitDragging?: boolean;
}
