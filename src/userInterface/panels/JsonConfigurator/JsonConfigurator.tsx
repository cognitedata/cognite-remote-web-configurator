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

export const JsonConfigurator: React.FC<any> = () => {

    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, JsonConfig> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const [originalJsonConfig, setOriginalJsonConfig] = useState<JsonConfig | null>(null);
    const [customSchema, setCustomSchema] = useState<IOpenApiSchema | null>(null);
    const resolvedJsonRef = useRef<JsonPayLoad | null>(null);

    const jsonEditorElm = useRef<HTMLDivElement | null>(null);
    const [title, setTitle] = useState(LOCALIZATION.UNTITLED);
    const [mode, setMode] = useState('tree');
    const [isEdited, setIsEdited] = useState(false);

    const [showMerge, setShowMerge] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

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


    const reloadJsonConfigs = async (jsonConfigId: number | null, resolvedJson?: any) => {
        await loadJsonConfigs();
        if (resolvedJson) {
            resolvedJsonRef.current = resolvedJson;
        } else {
            resolvedJsonRef.current = null;
        }
        setSelectedJsonConfigId(jsonConfigId);
    }

    const isEqualConfigs = (configA: JsonConfig | null, configB: JsonConfig | null) => {
        return isEqual(configA?.data, configB?.data)
    };

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { originalConfig: options.originalConfig, editedConfig: options.editedConfig };
        diffMode.current = options.diffMode;
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
                }
                break;
            }
            case CommandEvent.saveAs: {
                const newJson = await JsonConfigCommandCenter.onSaveAs();
                if (newJson) {
                    setJsonConfig(newJson);
                    setSelectedJsonConfigId(newJson.id);
                    await reloadJsonConfigs(newJson.id);
                }
                break;
            }
            case CommandEvent.update: {
                return await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId, args[0]);
            }
            case CommandEvent.delete: {
                await JsonConfigCommandCenter.onDelete(selectedJsonConfigId);
                await reloadJsonConfigs(null);
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
                let currentId = selectedJsonConfigId;
                const resolvedJson = args[0];
                const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs();
                setJsonConfigMap(jsonConfigs);
                if (!jsonConfigs.get(selectedJsonConfigId)) {
                    currentId = null;
                }
                if (resolvedJson) {
                    resolvedJsonRef.current = resolvedJson;
                } else {
                    resolvedJsonRef.current = null;
                }
                setSelectedJsonConfigId(currentId);
                setRefreshing(false);
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

    // on select new config from panel or selecting new config

    useEffect(() => {
        if (selectedJsonConfigId) {
            let selectedJsonConfig;
            if (jsonConfigMap && jsonConfigMap.size > 0) {
                selectedJsonConfig = jsonConfigMap.get(selectedJsonConfigId);
            }
            if (selectedJsonConfig) {
                if (!isEqualConfigs(selectedJsonConfig, jsonConfig)) {
                    JsonConfigCommandCenter.setEditorText(selectedJsonConfig?.data);
                }
                setJsonConfig(selectedJsonConfig);
                setOriginalJsonConfig(selectedJsonConfig);
            } else {
                console.error("JSON config not found in map!,", selectedJsonConfigId)
            }

            if (resolvedJsonRef.current) {
                setJsonConfig({
                    id: selectedJsonConfigId,
                    data: resolvedJsonRef.current
                });
                JsonConfigCommandCenter.updateEditorText(resolvedJsonRef.current);
            }
            resolvedJsonRef.current = null;

        } else {
            let newConfig = {} as JsonPayLoad;
            if (resolvedJsonRef.current) {
                newConfig = resolvedJsonRef.current;
                setJsonConfig({
                    data: newConfig,
                    id: null
                } as JsonConfig);
                JsonConfigCommandCenter.updateEditorText(newConfig);
                resolvedJsonRef.current = null;
            } else {
                setJsonConfig({
                    data: newConfig,
                    id: null
                } as JsonConfig);
                JsonConfigCommandCenter.setEditorText(newConfig);
            }
            setOriginalJsonConfig(null);
        }
    }, [selectedJsonConfigId, jsonConfigMap]);

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
                    selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.fullEditor}>
                <div className={classes.editorCommandContainer}>
                    <CommandPanel
                        title={title}
                        mode={mode}
                        refreshing={refreshing}
                        setRefreshing={setRefreshing}
                        commandEvent={onCommand}
                        isEdited={isEdited}
                        reloadJsonConfigs={reloadJsonConfigs}
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
