import { HttpRequestOptions, HttpResponse } from "@cognite/sdk/dist/src";
import { Client } from "../cdf/client";
import { JsonConfigCommandCenter } from "./JsonConfigCommandCenter";

const cogniteClient = Client.sdk;

export class CDFOperations {
    public static loadJsonConfigs = async (): Promise<HttpResponse<any>> => {
        return await cogniteClient.get(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`);
    }

    public static onSaveAs = async (): Promise<HttpResponse<any>> => {
        const currentJson = JsonConfigCommandCenter.currentJson;

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    { "data": currentJson }
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options);
    }
}