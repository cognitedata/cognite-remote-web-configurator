import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { loadSchema } from "../validator/Validator";
import { Client } from "../cdf/client";
import { HttpRequestOptions } from "@cognite/sdk/dist/src";
import { saveAs } from 'file-saver';

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

    public static onDownload = (): void => {
        const currentJson = JsonConfigCommandCenter.currentJson;
        let fileName = currentJson.header?.name
        if (!fileName || fileName === "") {
            fileName = "Untitled Json Config";
            alert("Download Cancelled!\nPlease add a file name");
        }
        else {
            const blob = new Blob([currentJson], { type: 'application/json;charset=utf-8' });
            saveAs(blob, fileName);
        }
    }
}
