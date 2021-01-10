export interface Api {
    jsonList(): Promise<any>;
    saveJson(json: any): Promise<any>;
    updateJson(id: number, json: any): Promise<any>;
    deleteJson(id: number): Promise<any>;
}
