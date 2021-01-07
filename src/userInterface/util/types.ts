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
    localConfig: any;
    serverConfig: any;
    onOk: (mergedJson: any) => void;
    onCancel: () => void;
}
