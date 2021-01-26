import { HttpRequestOptions, HttpResponse } from "@cognite/sdk/dist/src";
import { Client } from "../cdf/client";
import { Api } from "./Api";

const cogniteClient = Client.sdk;

export class DigitalTwinApi implements Api {

    public jsonList = async (): Promise<any> => {
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
            });
    }

    public saveJson = async (json: any): Promise<HttpResponse<any>> => {

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    { "data": json }
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options)
            .then( response => {
                console.log("Saved Digital Twin List successfully!");
                return response.data.data.items[0];
            })
    }

    public updateJson = async (configId: number, json: any): Promise<HttpResponse<any>> => {

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    {
                        "id": configId,
                        "data": json
                    }
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/update`, options);
    }

    public deleteJson = async (configId: number): Promise<HttpResponse<any>> => {
        const options: HttpRequestOptions = {
            data: {
                "items": [
                    configId
                ]
            }
        };

        return await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/delete`, options)
    }
}
