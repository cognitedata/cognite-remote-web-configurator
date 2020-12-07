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
