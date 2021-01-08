import { JSONEditorOptions } from "jsoneditor";

export interface JsonConfig {
    id: number;
    data: {
        assets?: any[];
        header: {
            name: string;
            type: string;
        }
    }
}

export interface JsonEditorOptions extends JSONEditorOptions {
    limitDragging?: boolean;
}
