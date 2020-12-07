import JSONEditor from "jsoneditor";
import { Modes } from "./enums/Modes";

export class JsonConfigCommandCenter{
    public static editorInstance: JSONEditor;


    public static onModeChange(mode: Modes): void {
        if(JsonConfigCommandCenter.editorInstance) {
            JsonConfigCommandCenter.editorInstance.setMode(mode);
        }
    }
}
