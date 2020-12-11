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

    public static loadDigitalTwins = (digitalTwinConfigMap: (twinNames: Map<number, unknown> | null) => void): void => {
        (async () => {
            await cogniteClient.get(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`)
                .then(response => {
                    console.log("Retrieved Digital Twin List successfully");
                    const twins = response.data.data?.items;
                    const twinMap = new Map();

                    for (const twin of twins) {
                        const twinId = twin.id;
                        twinMap.set(twinId, twin);
                    }
                    digitalTwinConfigMap(twinMap);
                })
                .catch(error => {
                    console.error("Retrieved Digital Twin List failed");
                    JsonConfigCommandCenter.errorAlert("Save Cancelled!", error);
                });
        })();
    }

    // call with undefind values to create new config
    public static onJsonConfigSelect = (
        configId: number,
        digitalTwinConfigMap: Map<number, unknown> | null,
        setSelectedTwinId: (configId: number | null) => void,
        setJsonConfig: (jsonConfig: JsonConfig | null) => void
    ): void => {
        if (configId) {
            const configMap = digitalTwinConfigMap;
            if (configMap && configMap.size > 0) {
                const config = configMap.get(configId);
                if (config) {
                    setJsonConfig(config as JsonConfig);
                }
            }
            setSelectedTwinId(configId);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedTwinId(null);
        }
    }

    public static errorAlert = (message: string, error: string): void => {
        const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
        const errorcode = `${error}`.split(" | ")[1].split(": ")[1];

        alert(`${message}\n${errorMsg}`);
    }

    public static onModeChange(mode: Modes): void {
        if (JsonConfigCommandCenter.editorInstance) {
            JsonConfigCommandCenter.editorInstance.setMode(mode);
        }
    }

    public static onUpdate = (): void => {
        console.warn("Update As function not implemented");
    }

    public static onDelete = (): void => {
        console.warn("Delete As function not implemented");
    }

    public static onSaveAs = (reloadSavedTwin: (configId: number) => void): void => {
        const currentJson = JsonConfigCommandCenter.currentJson;

        const options: HttpRequestOptions = {
            data: {
                "items": [
                    { "data": currentJson }
                ]
            }
        };

        if (confirm("Do you want to cretate new twin?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options,)
                    .then(response => {
                        const createdId = response.data.data.items[0].id;
                        reloadSavedTwin(createdId);
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
