import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { loadSchema } from "../validator/Validator";
import { Client } from "../cdf/client";
import { HttpRequestOptions } from "@cognite/sdk/dist/src";
import { JsonConfig } from "../userInterface/util/types";

const cogniteClient = Client.sdk;

export class JsonConfigCommandCenter {
    private static editorInstance: CogniteJsonEditor;

    public static async createEditor(elm: HTMLElement): Promise<void> {
        await loadSchema();
        const options = new CogniteJsonEditorOptions();
        JsonConfigCommandCenter.editorInstance = new CogniteJsonEditor(elm, options);
    }

    public static get editor(): CogniteJsonEditor | null {
        if (JsonConfigCommandCenter.editorInstance) {
            return JsonConfigCommandCenter.editorInstance;
        } else {
            console.error("Cannot retrieve editor before instantiation!");
            return null;
        }
    }

    public static get currentJson(): any {
        const currentJsonText = JsonConfigCommandCenter.editor?.getText();
        if (currentJsonText) {
            return JSON.parse(currentJsonText);
        }
    }

    public static loadJsonConfigs = (setJsonConfigMap: (jsonConfigId: Map<number, unknown> | null) => void): void => {
        (async () => {
            await cogniteClient.get(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`)
                .then(response => {
                    console.log("Retrieved Json Config List successfully");
                    const jsonConfigs = response.data.data?.items;
                    const jsonConfigMap = new Map();

                    for (const jsonConfig of jsonConfigs) {
                        const jsonConfigId = jsonConfig.id;
                        jsonConfigMap.set(jsonConfigId, jsonConfig);
                    }
                    setJsonConfigMap(jsonConfigMap);
                })
                .catch(error => {
                    JsonConfigCommandCenter.errorAlert("Load Json Config list failed!", error);
                });
        })();
    }

    // call with undefind values to create new json Config
    public static onJsonConfigSelect = (
        jsonConfigId: number | null,
        jsonConfigMap: Map<number, unknown> | null,
        setSelectedJsonConfigId: (jsonConfigId: number | null) => void,
        setJsonConfig: (jsonConfig: JsonConfig | null) => void
    ): void => {
        if (jsonConfigId) {
            const configMap = jsonConfigMap;
            if (configMap && configMap.size > 0) {
                const jsonConfig = configMap.get(jsonConfigId);
                if (jsonConfig) {
                    setJsonConfig(jsonConfig as JsonConfig);
                }
            }
            setSelectedJsonConfigId(jsonConfigId);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedJsonConfigId(null);
        }
    }

    public static errorAlert = (message: string, error: string): void => {
        const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
        const errorcode = `${error}`.split(" | ")[1].split(": ")[1];

        alert(`${message}\n${errorMsg}`);
        console.error(`${errorcode}: ${message}\n${errorMsg}`);
    }

    public static onModeChange(mode: Modes): void {
        if (JsonConfigCommandCenter.editorInstance) {
            JsonConfigCommandCenter.editorInstance.setMode(mode);
        }
    }

    public static onUpdate = (selectedJsonConfigId: number | null, reloadJsonConfigs: (jsonConfigId: number | null) => void): void => {
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

        if (confirm("Do you want to cretate new Json Config?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/update`, options,)
                    .then(response => {
                        const createdId = response.data.data.items[0].id;
                        reloadJsonConfigs(createdId);
                        alert("Data updated successfully!");
                    })
                    .catch(error => {
                        JsonConfigCommandCenter.errorAlert("Update failed!", error);
                    });
            })();
        }
    }

    public static onDelete = (selectedJsonConfigId: number | null, reloadJsonConfigs: (jsonConfigId: number | null) => void): void => {
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

        if (confirm("Do You Want to Remove This Json Config?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins/delete`, options,)
                    .then(() => {
                        reloadJsonConfigs(null);
                        alert("Json Config Deleted successfully!");
                    })
                    .catch(error => {
                        JsonConfigCommandCenter.errorAlert("Delete Cancelled!", error);
                    });
            })();
        }
    }

    public static onSaveAs = (reloadJsonConfigs: (jsonConfigId: number) => void): void => {
        const currentJson = JsonConfigCommandCenter.currentJson;

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    { "data": currentJson }
                ]
            }
        };

        if (confirm("Do you want to cretate new Json Config?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options,)
                    .then(response => {
                        const createdId = response.data.data.items[0].id;
                        reloadJsonConfigs(createdId);
                        alert("Data saved successfully!");
                    })
                    .catch(error => {
                        JsonConfigCommandCenter.errorAlert("Save Cancelled!", error);
                    });
            })();
        }
    }

    public static onDownload = (): void => {
        console.warn("Download function not implemented");
    }
}
