import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig, JsonPayLoad, MergeOptions } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { JsonEditorContainer } from "../../components/JsonEditorContainer/JsonEditorContainer";
import { DiffMerge } from "../../components/DiffMerge/DiffMerge";
import { MergeModes } from '../../util/enums/MergeModes';
import { LOCALIZATION } from '../../../constants';
import { isEqual } from "lodash-es";
import { IOpenApiSchema } from "../../../validator/interfaces/IOpenApiSchema";

export const extractErrorMessage = (error: string): string => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    console.error("Extracted Error message:", error);
    return errorMsg;
}

export const isEqualConfigs = (configA: JsonConfig | null, configB: JsonConfig | null) => {
    return isEqual(configA?.data, configB?.data)
};

export const JsonConfigurator: React.FC<any> = () => {

    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, JsonConfig> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const [originalJsonConfig, setOriginalJsonConfig] = useState<JsonConfig | null>(null);
    const [customSchema, setCustomSchema] = useState<IOpenApiSchema | null>(null);

    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const [title, setTitle] = useState(LOCALIZATION.UNTITLED);
    const [mode, setMode] = useState('tree');
    const [isEdited, setIsEdited] = useState(false);

    const [showMerge, setShowMerge] = useState<boolean>(false);
    const compareJsons = useRef<{ originalConfig: string, editedConfig: string }>();
    const handleOkMerge = useRef<any>(() => { console.log('not set'); });
    const handleCancelMerge = useRef<any>(() => null);
    const diffMode = useRef<MergeModes>();

    const loadJsonConfigs = async () => {
        const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs();
        setJsonConfigMap(jsonConfigs);
    }

    useEffect(() => {
        loadJsonConfigs();
    }, []);

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { originalConfig: options.originalConfig, editedConfig: options.editedConfig };
        diffMode.current = options.diffMode;
        handleOkMerge.current = options.onOk;
        handleCancelMerge.current = options.onCancel;
        setShowMerge(true);
    }


    const onCommand = async (command: CommandEvent, ...args: any[]): Promise<any> => {

        const loadJsonConfigsAndReturnLatest = async (id: number | null): Promise<[Map<number, JsonConfig>, JsonConfig | null]> => {
            const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs();

            let selectedJsonConfig = null;
            if (id !== null && jsonConfigs && jsonConfigs.size > 0) {
                selectedJsonConfig = jsonConfigs.get(id);
            }
            return [jsonConfigs, selectedJsonConfig];
        }

        switch (command) {
            case CommandEvent.mode: {
                setMode(args[0]);
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.switchConfig: {
                const configId = args[0];
                setSelectedJsonConfigId(configId);
                if (configId === null) { // new config
                    const newConfig = {} as JsonPayLoad;
                    setJsonConfig({
                        data: newConfig,
                        id: null
                    } as JsonConfig);
                    JsonConfigCommandCenter.setEditorText(newConfig);
                    setOriginalJsonConfig(null);
                } else {
                    let selectedJsonConfig;
                    if (jsonConfigMap && jsonConfigMap.size > 0) {
                        selectedJsonConfig = jsonConfigMap.get(configId);
                    }
                    if (selectedJsonConfig) {
                        JsonConfigCommandCenter.setEditorText(selectedJsonConfig?.data);
                        setJsonConfig(selectedJsonConfig);
                        setOriginalJsonConfig(selectedJsonConfig);
                    } else {
                        console.error("JSON config not found in map!,", selectedJsonConfigId)
                    }
                }
                break;
            }
            case CommandEvent.saveAs: {
                const mergeResult = args[0]; // local changes if server version was deleted in the server on save
                if (mergeResult) { //
                    JsonConfigCommandCenter.updateEditorText(mergeResult);
                }
                const newJson = await JsonConfigCommandCenter.onSaveAs();
                if (newJson) {
                    const configId = newJson.id;
                    const [jsonConfigs, latestConfig] = await loadJsonConfigsAndReturnLatest(configId);

                    setJsonConfigMap(jsonConfigs);
                    setSelectedJsonConfigId(configId);

                    if (latestConfig) {
                        if (!isEqualConfigs(latestConfig, jsonConfig)) {
                            JsonConfigCommandCenter.updateEditorText(latestConfig?.data);
                        }
                        setJsonConfig(latestConfig);
                        setOriginalJsonConfig(latestConfig);
                        return latestConfig;
                    } else {
                        console.error("JSON config not found in map!,", selectedJsonConfigId)
                        return null;
                    }
                }
                break;
            }
            case CommandEvent.update: {
                const currentJson = args[0];
                const updatedConfig =  await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId, currentJson);
                if (updatedConfig) {
                    const configId = updatedConfig.id;
                    const [jsonConfigs, latestConfig] = await loadJsonConfigsAndReturnLatest(configId);

                    setJsonConfigMap(jsonConfigs);
                    setSelectedJsonConfigId(configId);

                    if (latestConfig) {
                        if (!isEqualConfigs(latestConfig, jsonConfig)) {
                            JsonConfigCommandCenter.updateEditorText(latestConfig?.data);
                        }
                        setJsonConfig(latestConfig);
                        setOriginalJsonConfig(latestConfig);
                    } else {
                        console.error("JSON config not found in map!,", selectedJsonConfigId)
                    }
                }
                break;
            }
            case CommandEvent.delete: {
                const status = await JsonConfigCommandCenter.onDelete(selectedJsonConfigId);
                if (status) {
                    const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs();
                    setJsonConfigMap(jsonConfigs);
                    setSelectedJsonConfigId(null);

                    // switch to blank
                    const newConfig = {} as JsonPayLoad;
                    setJsonConfig({
                        data: newConfig,
                        id: null
                    } as JsonConfig);
                    JsonConfigCommandCenter.setEditorText(newConfig);
                    setOriginalJsonConfig(null);
                }
                break;
            }
            case CommandEvent.download: {
                JsonConfigCommandCenter.onDownload();
                break;
            }
            case CommandEvent.diff: {
                setJsonConfig({ data: args[0] } as JsonConfig);
                break;
            }
            case CommandEvent.loadSchema: {
                setCustomSchema(args[0] || null);
                break;
            }
            case CommandEvent.reload: {
                const currentJson = args[0] || jsonConfig?.data; // local changes if server version was deleted in the server on save

                const [jsonConfigs, latestConfig] = await loadJsonConfigsAndReturnLatest(selectedJsonConfigId);

                setJsonConfigMap(jsonConfigs);

                if (latestConfig) {

                    JsonConfigCommandCenter.updateEditorText(currentJson);
                    setJsonConfig({ id: selectedJsonConfigId, data: currentJson});

                    if(!isEdited) {
                        JsonConfigCommandCenter.setEditorText(latestConfig?.data);
                        setJsonConfig(latestConfig);
                    }
                    setOriginalJsonConfig(latestConfig);
                } else {
                    // if currently selected config is deleted
                    if (!isEdited) { // if view not edited reset
                        const newConfig = {} as JsonPayLoad;
                        setJsonConfig({
                            data: newConfig,
                            id: null
                        } as JsonConfig);
                        JsonConfigCommandCenter.setEditorText(newConfig);
                    } else {
                        JsonConfigCommandCenter.updateEditorText(currentJson);
                    }

                    setSelectedJsonConfigId(null);
                    setOriginalJsonConfig(null);
                }
                break;
            }
            default:
                break;
        }
    }

    useEffect(() => {
        window.addEventListener("beforeunload", function (e) {
            if (isEdited) {
                (e || window.event).returnValue = true; //Gecko + IE
                return true; //Gecko + Webkit, Safari, Chrome etc.
            }
            return false;
        });
    }, []);

    // set title

    useEffect(() => {
        const checkEditStatus = (currentConfig: JsonConfig | null, originalConfig: JsonConfig | null) => {
            if (currentConfig) {
                if (originalConfig === null) {
                    return !!Object.keys(currentConfig?.data).length;
                } else {
                    return !isEqualConfigs(originalConfig, currentConfig);
                }
            }
            return false;
        };

        const updateTitle = (currentConfig: JsonConfig | null, originalConfig: JsonConfig | null): void => {
            const editStatus = checkEditStatus(currentConfig, originalConfig);

            if (JsonConfigCommandCenter.editor) {
                const currentTitle = (editStatus ? '*' : '') + (JsonConfigCommandCenter.currentFileName || LOCALIZATION.UNTITLED);
                const currentMode = JsonConfigCommandCenter.editor?.getMode();

                setTitle(currentTitle);
                setMode(currentMode);
            }
            setIsEdited(editStatus);
        }


        updateTitle(jsonConfig, originalJsonConfig);
    }, [jsonConfig, originalJsonConfig, jsonConfigMap]);

    const onUpdateJson = (json: JsonPayLoad) => {
        setJsonConfig({
            id: selectedJsonConfigId || null,
            data: json
        });
    }

    return (
        <div className={classes.configurator}>
            <div className={classes.sideNavPanel}>
                <SideNavPanel
                    isEdited={isEdited}
                    commandEvent={onCommand}
                    jsonConfigMap={jsonConfigMap}
                    selectedJsonConfigId={selectedJsonConfigId}/>
            </div>
            <div className={classes.fullEditor}>
                <div className={classes.editorCommandContainer}>
                    <CommandPanel
                        title={title}
                        mode={mode}
                        commandEvent={onCommand}
                        isEdited={isEdited}
                        setMergeOptions={setMergeOptions}
                        selectedJsonConfigId={selectedJsonConfigId}
                        originalJsonConfig={originalJsonConfig}
                    />
                    <JsonEditorContainer
                        onUpdateJson={onUpdateJson}
                        jsonEditorElm={jsonEditorElm}
                        customSchema={customSchema}
                    />
                </div>
            </div>
            <div>
                {diffMode.current &&
                    <DiffMerge
                        setShowMerge={setShowMerge}
                        showPopup={showMerge}
                        originalConfig={compareJsons.current?.originalConfig}
                        editedConfig={compareJsons.current?.editedConfig}
                        onMerge={handleOkMerge.current}
                        onCancel={handleCancelMerge.current}
                        diffMode={diffMode.current}
                    />
                }
            </div>
        </div>
    );
}
