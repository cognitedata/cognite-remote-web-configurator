import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { loadSchema } from "../validator/Validator";
import { saveAs } from 'file-saver';
import { CDFOperations } from "./CDFOperations";

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

    public static loadJsonConfigs = async (): Promise<any> => {
        return await CDFOperations.loadJsonConfigs();
    }

    public static errorAlert = (message: string, error: string): void => {
        if (!error === null) {
            const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
            const errorcode = `${error}`.split(" | ")[1].split(": ")[1];

            alert(`${message}\n${errorMsg}`);
            console.error(`${errorcode}: ${message}\n${errorMsg}`);
        }
    }

    public static onModeChange(mode: Modes): void {
        if (JsonConfigCommandCenter.editorInstance) {
            JsonConfigCommandCenter.editorInstance.setMode(mode);
        }
    }

    public static onSaveAs = async (): Promise<any> => {
        const currentJson = JsonConfigCommandCenter.currentJson;
        const fileName = currentJson.header?.name;
        if (!fileName || fileName === "") {
            alert("Save Cancelled!\nPlease add a file name");
        }
        else {
            return await CDFOperations.onSaveAs();
        }
    }

    public static onUpdate = async (selectedJsonConfigId: number | null): Promise<any> => {
        if (!selectedJsonConfigId) {
            alert("Please select a file");
        }
        else {
            return await CDFOperations.onUpdate(selectedJsonConfigId);
        }
    }

    public static onDelete = async (selectedJsonConfigId: number | null): Promise<any> => {
        if (!selectedJsonConfigId) {
            alert("Please select a file");
        }
        else {
            return await CDFOperations.onDelete(selectedJsonConfigId);
        }
    }

    public static onDownload = (): void => {
        const currentJson = JsonConfigCommandCenter.currentJson;
        let fileName = currentJson.header?.name
        if (!fileName || fileName === "") {
            fileName = "Untitled Json Config";
        }
        const blob = new Blob([currentJson], { type: 'application/json;charset=utf-8' });
        saveAs(blob, fileName);
    }
}
