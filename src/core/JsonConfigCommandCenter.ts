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
import * as YAML from "js-yaml";
import ymlFile from "../config/twinconfig.yaml";
import { IOpenApiSchema } from "../validator/interfaces/IOpenApiSchema";

export class JsonConfigCommandCenter {
    public static editorErrors: Map<string, string[]> = new Map();
    public static hasErrors = false;
    public static schemaErrors: string[] = [];
    private static editorInstance: CogniteJsonEditor;
    private static apiInstance: Api;

    public static async createEditor(elm: HTMLElement, schema: IOpenApiSchema, onChange: (text: string) => void): Promise<void> {
        // Schema errors need to reset before loading new schema
        this.schemaErrors = [];

        await SchemaResolver.parseYAMLFile(schema);
        JsonConfigCommandCenter.apiInstance = new DigitalTwinApi();
        const options = new CogniteJsonEditorOptions(onChange);

        // To force reload the content, innerHTML needs to be changed
        elm.innerHTML = '<div/>';

        JsonConfigCommandCenter.editorInstance = new CogniteJsonEditor(elm, options);
    }

    public static get editor(): CogniteJsonEditor | null {
        if (JsonConfigCommandCenter.editorInstance) {
            return JsonConfigCommandCenter.editorInstance;
        } else {
            console.warn("Editor not instantiated!");
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

    public static setEditorText(json: JsonPayLoad | null) {
        const editor = JsonConfigCommandCenter.editor;
        if (editor) {
            editor.set(json);
        }
    }

    public static updateEditorText(json: JsonPayLoad | null) {
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

    public static onSaveAs = async (): Promise<number | null> => {
        const currentJson = JsonConfigCommandCenter.currentJson;
        return await JsonConfigCommandCenter.api.saveJson(currentJson)
            .then((id: number) => {
                message.success(LOCALIZATION.SAVE_SUCCESS);
                return id;
            })
            .catch((error: any) => {
                message.error(LOCALIZATION.SAVE_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                return null;
            });
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

    public static onLoadSchema = async (elm: HTMLElement | null, onChange: (text: string) => void, schema: IOpenApiSchema | null): Promise<void> => {
        if (elm) {
            if(schema){
                await JsonConfigCommandCenter.createEditor(elm, schema, onChange);
            } else {
                const configFile = await fetch(ymlFile).then(response => response.text());
                const schema = YAML.load(configFile) as IOpenApiSchema;
                await JsonConfigCommandCenter.createEditor(elm, schema, onChange);
            }
        }
    }
}
