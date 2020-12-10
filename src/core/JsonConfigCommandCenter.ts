import { Modes } from "../userInterface/util/enums/Modes";
import { CogniteJsonEditor } from "./CogniteJsonEditor";
import { CogniteJsonEditorOptions } from "./CogniteJsonEditorOptions";
import { loadSchema } from "../validator/Validator";
import { Client } from "../cdf/client";
import { HttpRequestOptions } from "@cognite/sdk/dist/src";

const cogniteClient = Client.sdk;

const errorAlert = (message: string, error: string): void => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    const errorcode = `${error}`.split(" | ")[1].split(": ")[1];

    alert(`${message}\n${errorMsg}`);
}

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

    public static onModeChange(mode: Modes): void {
        if (JsonConfigCommandCenter.editorInstance) {
            JsonConfigCommandCenter.editorInstance.setMode(mode);
        }
    }

    public static onUpdate(): void {
        console.warn("Update As function not implemented");
    }

    public static onDelete(): void {
        console.warn("Delete As function not implemented");
    }

    public static onSaveAs(): void {
        // const options: HttpRequestOptions = JsonConfigCommandCenter.currentJson;
        const options: HttpRequestOptions = {
            data:{
                "items": [
                    {
                        "data": {
                            "assets": {
                                "geometries": {}
                            },
                            "header": {
                                "name": "Windmill Island GDE 2"
                            },
                            "scenes": [
                                {
                                    "actors": [
                                        {
                                            "name": "<UNIQUE NAME FOR THE ACTOR>",
                                            "type": "actor",
                                            "transform": {
                                                "type": "unrealTransform",
                                                "scale": [
                                                    1,
                                                    1,
                                                    1
                                                ],
                                                "position": [
                                                    0,
                                                    0,
                                                    0
                                                ],
                                                "rotation": [
                                                    0,
                                                    0,
                                                    0
                                                ]
                                            },
                                            "components": []
                                        }
                                    ],
                                    "camera": {
                                        "initialCoordinates": {
                                            "type": "unrealTransform",
                                            "scale": [
                                                1,
                                                1,
                                                1
                                            ],
                                            "position": [
                                                0,
                                                0,
                                                10000
                                            ],
                                            "rotation": [
                                                -25,
                                                0,
                                                0
                                            ]
                                        }
                                    },
                                    "visibilityLayers": [],
                                    "waterPlane": {
                                        "transform": {
                                            "type": "unrealTransform",
                                            "scale": [
                                                10,
                                                10,
                                                10
                                            ],
                                            "position": [
                                                0,
                                                0,
                                                0
                                            ],
                                            "rotation": [
                                                0,
                                                0,
                                                0
                                            ]
                                        },
                                        "followCamera": false
                                    },
                                    "environmentControl": {
                                        "renderSkySphere": true
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        } 

        console.warn("Save As function not implemented");
        if (confirm("Do you want to cretate new twin?")) {
            (async () => {
                await cogniteClient.post(`${cogniteClient.getBaseUrl()}/api/playground/projects/${cogniteClient.project}/twins`, options,)
                    .then(response => {
                        console.log(response);
                        alert("Data saved successfully!");
                    })
                    .catch(error => {
                        errorAlert("Save Cancelled!", error);
                    });
            })();
        }
    }

    public static onDownload(): void {
        console.warn("Download function not implemented");
    }
}
