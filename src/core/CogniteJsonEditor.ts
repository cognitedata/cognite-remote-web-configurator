import JSONEditor from "jsoneditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";

export class CogniteJsonEditor extends JSONEditor {

    constructor(elm: HTMLElement, options: CogniteJsonEditorOptions, json?: any) {
        super(elm, options.options, json);
    }
}
