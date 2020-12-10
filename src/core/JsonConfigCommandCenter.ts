import { MutableRefObject } from "react";
import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { loadSchema } from "../validator/Validator";
import { Client } from "../cdf/client";
import { HttpRequestOptions } from "@cognite/sdk/dist/src";

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

    public static loadDigitalTwins(setDigitalTwinNames: (twinNames: string[]) => void, digitalTwinConfigMap: MutableRefObject<Map<string, unknown> | null>): any {
        (async () => {
            await cogniteClient.get(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`)
                .then(response => {
                    console.log("Retrieved Digital Twin List successfully");
                    const twins = response.data.data?.items;
                    const twinNames = [];
                    const twinMap = new Map();

                    for (const twin of twins) {
                        const twinName = twin?.data?.header?.name || twin.id;
                        twinNames.push(twinName);
                        twinMap.set(twinName, twin);
                    }
                    setDigitalTwinNames(twinNames);
                    digitalTwinConfigMap.current = twinMap;
                })
                .catch(error => {
                    console.error("Retrieved Digital Twin List failed");
                    JsonConfigCommandCenter.errorAlert("Save Cancelled!", error);
                });
        })();
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

    public static onSaveAs = (loadDigitalTwins: () => void): void => {
        const currentJson = { "data": JsonConfigCommandCenter.currentJson };
        const options: HttpRequestOptions = {
            data: {
                "items": [
                    currentJson
                ]
            }
        };

        if (confirm("Do you want to cretate new twin?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options,)
                    .then(response => {
                        console.log(response);
                        alert("Data saved successfully!");
                        loadDigitalTwins();
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
