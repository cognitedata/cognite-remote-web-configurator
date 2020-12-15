import { HttpRequestOptions, HttpResponse } from "@cognite/sdk/dist/src";
import { Client } from "../cdf/client";
import { JsonConfigCommandCenter } from "./JsonConfigCommandCenter";

const cogniteClient = Client.sdk;

export class CDFOperations {
    public static loadJsonConfigs = async (): Promise<any> => {
        return await cogniteClient.get(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`)
            .then(response => {
                console.log("Retrieved Digital Twin List successfully");
                const jsonConfigs = response.data.data?.items;
                const jsonConfigIdMap = new Map();

                for (const jsonConfig of jsonConfigs) {
                    const jsonConfigId = jsonConfig.id;
                    jsonConfigIdMap.set(jsonConfigId, jsonConfig);
                }
                return jsonConfigIdMap;
            })
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

    public static onUpdate = async (selectedJsonConfigId: number | null): Promise<HttpResponse<any>> => {
        const currentJson = JsonConfigCommandCenter.currentJson;

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    {
                        "id": selectedJsonConfigId,
                        "data": currentJson
                    }
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/update`, options);
    }

    public static onDelete = async (selectedJsonConfigId: number | null, ): Promise<HttpResponse<any>> => {
        const items: number[] = []
        if (selectedJsonConfigId) {
            items.push(selectedJsonConfigId);
        }
        const options: HttpRequestOptions = {
            data: {
                "items": [
                    ...items
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/delete`, options)
    }

}