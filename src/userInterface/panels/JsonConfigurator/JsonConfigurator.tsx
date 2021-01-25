import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig, JsonPayLoad, MergeOptions } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { JsonEditorContainer } from "../../components/JsonEditorContainer/JsonEditorContainer";
import { DiffMerge } from "../../components/DiffMerge/DiffMerge";
import { LOCALIZATION } from '../../../constants';

export const extractErrorMessage = (error: string): string => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    console.error("Extracted Error message:", error);
    return errorMsg;
}

export const JsonConfigurator: React.FC<any> = () => {

    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, JsonConfig> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const [originalJsonConfig, setOriginalJsonConfig] = useState<JsonConfig | null>(null);

    const [title, setTitle] = useState(LOCALIZATION.UNTITLED);
    const [mode, setMode] = useState('tree');

    const [showMerge, setShowMerge] = useState<boolean>(false);
    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const compareJsons = useRef<{ currentJson: string, newJson: string }>();
    const handleOkMerge = useRef<any>(() => { console.log('not set'); });
    const handleCancelMerge = useRef<any>(() => null);
    const saveAfterMerge = useRef<boolean>(false);

    const resolvedJsonRef = useRef<JsonPayLoad | null>(null);
    const [isEdited, setIsEdited] = useState(false);

    const loadJsonConfigs = async () => {
        const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs();
        setJsonConfigMap(jsonConfigs);
    }

    useEffect(() => {
        loadJsonConfigs();
    }, []);


    const reloadJsonConfigs = async (jsonConfigId: number | null, resolvedJson?: any) => {
        await loadJsonConfigs();
        if (resolvedJson) {
            resolvedJsonRef.current = resolvedJson;
        } else {
            resolvedJsonRef.current = null;
        }
        setSelectedJsonConfigId(jsonConfigId);
    }

    const checkEditStatus = (currentConfig: JsonConfig | null, originalConfig: JsonConfig | null) => {
        if (currentConfig) {
            if (originalConfig === null) {
                return !!Object.keys(currentConfig?.data).length;
            }
            else {
                return (JSON.stringify(originalConfig?.data) !== JSON.stringify(currentConfig?.data));
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

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { currentJson: options.localConfig, newJson: options.serverConfig };
        saveAfterMerge.current = options.saveAfterMerge;
        handleOkMerge.current = options.onOk;
        handleCancelMerge.current = options.onCancel;
        setShowMerge(true);
    }


    const onCommand = async (command: CommandEvent, ...args: any[]): Promise<any> => {
        switch (command) {
            case CommandEvent.mode: {
                setMode(args[0]);
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.reload: {
                await reloadJsonConfigs(selectedJsonConfigId, args[0]);
                break;
            }
            case CommandEvent.switchConfig: {
                setSelectedJsonConfigId(args[0]);
                break;
            }
            case CommandEvent.saveAs: {
                return await JsonConfigCommandCenter.onSaveAs();
            }
            case CommandEvent.update: {
                return await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId, args[0]);
            }
            case CommandEvent.delete: {
                await JsonConfigCommandCenter.onDelete(selectedJsonConfigId);
                setSelectedJsonConfigId(null);
                break;
            }
            case CommandEvent.download: {
                JsonConfigCommandCenter.onDownload();
                break;
            }
            case CommandEvent.loadSchema: {
                JsonConfigCommandCenter.onLoadSchema(jsonEditorElm.current, args[0]);
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

    const onUpdateJson = (json: JsonPayLoad, id: number | null) => {
        setJsonConfig({
            id: id || 0,
            data: json
        });
    }

    // set current json and original json
    useEffect(() => {
        if(selectedJsonConfigId) {
            let selectedJsonConfig;
            if (jsonConfigMap && jsonConfigMap.size > 0) {
                selectedJsonConfig = jsonConfigMap.get(selectedJsonConfigId);
            }
            // set new json config and Original
            if (selectedJsonConfig) {
                if(originalJsonConfig?.id === selectedJsonConfigId) {
                    JsonConfigCommandCenter.updateEditorText = selectedJsonConfig?.data;
                } else {
                    JsonConfigCommandCenter.setEditorText = selectedJsonConfig?.data;
                }
                setJsonConfig(selectedJsonConfig);
                setOriginalJsonConfig(selectedJsonConfig);
            } else {
                console.error("JSON config not found in map!,", selectedJsonConfigId)
            }

            if (resolvedJsonRef.current) {
                setJsonConfig({
                    data: resolvedJsonRef.current
                } as JsonConfig);
                JsonConfigCommandCenter.updateEditorText = resolvedJsonRef.current;
            }
            resolvedJsonRef.current = null;
        } else {
            const blankConfig = {} as JsonPayLoad;
            setJsonConfig({
                data: blankConfig
            } as JsonConfig);
            setOriginalJsonConfig(null);
            JsonConfigCommandCenter.setEditorText = blankConfig;
        }
    }, [selectedJsonConfigId, jsonConfigMap]);

    // set title

    useEffect(() => {
        updateTitle(jsonConfig, originalJsonConfig);
    },[jsonConfig, originalJsonConfig, jsonConfigMap]);

    return (
        <div className={classes.configurator}>
            <div className={classes.sideNavPanel}>
                <SideNavPanel
                    isEdited={isEdited}
                    commandEvent={onCommand}
                    jsonConfigMap={jsonConfigMap}
                    selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.fullEditor}>
                <div className={classes.editorCommandContainer}>
                    <CommandPanel
                        title={title}
                        mode={mode}
                        commandEvent={onCommand}
                        isEdited={isEdited}
                        reloadJsonConfigs={reloadJsonConfigs}
                        setMergeOptions={setMergeOptions}
                        selectedJsonConfigId={selectedJsonConfigId}
                        originalJsonConfig={originalJsonConfig}
                    />
                    <JsonEditorContainer onUpdateJson={json => { onUpdateJson(json, selectedJsonConfigId) }} jsonEditorElm={jsonEditorElm} />
                </div>
            </div>
            <div>
                <DiffMerge
                    setShowMerge={setShowMerge}
                    showPopup={showMerge}
                    serverJson={compareJsons.current?.newJson}
                    localJson={compareJsons.current?.currentJson}
                    onMerge={handleOkMerge.current}
                    onCancel={handleCancelMerge.current}
                    saveAfterMerge={saveAfterMerge.current}
                />
            </div>
        </div>
    );
}
