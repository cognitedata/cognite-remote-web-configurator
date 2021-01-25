import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { saveAs } from 'file-saver';
import { DigitalTwinApi } from "./DigitalTwinApi";
import { Api } from "./Api";
import { SchemaResolver } from "../validator/SchemaResolver";
import message from "antd/es/message";
import { LOCALIZATION, USE_LOCAL_FILES_AND_NO_LOGIN } from "../constants";
import localJsonFile from "../config/MauiA.json";
import { extractErrorMessage } from "../userInterface/panels/JsonConfigurator/JsonConfigurator";
import { JsonPayLoad } from "../userInterface/util/types";

export class JsonConfigCommandCenter {
    public static editorErrors: Map<string, string[]> = new Map();
    public static hasErrors = false;
    public static schemaErrors: string[] = [];
    private static editorInstance: CogniteJsonEditor;
    private static apiInstance: Api;

    public static async createEditor(elm: HTMLElement, onChange: (text: string) => void): Promise<void> {
        await SchemaResolver.loadSchema();
        JsonConfigCommandCenter.apiInstance = new DigitalTwinApi();
        const options = new CogniteJsonEditorOptions(onChange);
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

    public static get api(): Api {
        if (!JsonConfigCommandCenter.apiInstance) {
            JsonConfigCommandCenter.apiInstance = new DigitalTwinApi();
        }
        return JsonConfigCommandCenter.apiInstance;
    }

    public static get currentJson(): any {
        const currentJsonText = JsonConfigCommandCenter.editor?.getText();
        let currentJson;
        if (currentJsonText) {
            try {
                currentJson = JSON.parse(currentJsonText);
            } catch (e: any) {
                console.error("Error occurred while parsing json!", e);
            }
        }
        return currentJson;
    }

    public static get currentFileName(): string {
        const currentJson = JsonConfigCommandCenter.currentJson;
        return currentJson?.header?.name;
    }

    public static get editorText(): JsonPayLoad | null {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            return (editor.get() as JsonPayLoad);
        }
        return null;
    }

    public static set setEditorText(json: JsonPayLoad | null) {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            editor.set(json);
        }
    }

    public static set updateEditorText(json: JsonPayLoad | null) {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            editor.update(json);
        }
    }

    public static loadJsonConfigs = async (): Promise<any> => {
        let jsonConfigs;
        try {
            jsonConfigs = await JsonConfigCommandCenter.api.jsonList();

        } catch(error) {
            message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
            if (USE_LOCAL_FILES_AND_NO_LOGIN) {
                jsonConfigs = new Map().set(123, { id: 123, data: localJsonFile });
            }
        }
        return jsonConfigs;
    }

    public static onModeChange(mode: Modes): void {
        if (JsonConfigCommandCenter.editor) {
            JsonConfigCommandCenter.editor.setMode(mode);
        }
    }

    public static onSaveAs = async (): Promise<any> => {
        const currentJson = JsonConfigCommandCenter.currentJson;
        return await JsonConfigCommandCenter.api.saveJson(currentJson);
    }

    public static onUpdate = async (selectedJsonConfigId: number | null, args: any): Promise<any> => {
        let currentJson = JsonConfigCommandCenter.currentJson;
        // override currentJson with resolved one
        if (args) {
            currentJson = args;
        }

        if (selectedJsonConfigId) {
            return await JsonConfigCommandCenter.api.updateJson(selectedJsonConfigId, currentJson);
        }
    }

    public static onDelete = async (selectedJsonConfigId: number | null): Promise<any> => {
        if (selectedJsonConfigId) {
            return await JsonConfigCommandCenter.api.deleteJson(selectedJsonConfigId);
        }
    }

    public static onDownload = (): void => {
        const currentJson = JSON.stringify(JsonConfigCommandCenter.currentJson);
        let fileName = JsonConfigCommandCenter.currentFileName;
        if (!fileName || fileName === "") {
            fileName = "Untitled Json Config";
        }
        const blob = new Blob([currentJson], { type: 'application/json;charset=utf-8' });
        saveAs(blob, fileName);
    }
}
