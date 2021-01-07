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

export interface MergeOptions {
    currentJson: any;
    newJson: any;
    onOk: (mergedJsonString: string) => void;
    onCancel: () => void;
}
