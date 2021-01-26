import { JSONEditorOptions } from "jsoneditor";

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
    localConfig: any;
    serverConfig: any;
    saveAfterMerge: boolean;
    onOk: (mergedJson: any) => void;
    onCancel: () => void;
}

export interface JsonEditorOptions extends JSONEditorOptions {
    limitDragging?: boolean;
}
