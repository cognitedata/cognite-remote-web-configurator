import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig, MergeOptions } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';
import message from 'antd/es/message';
import { DiffMerge } from "../../components/DiffMerge/DiffMerge";
import { LOCALIZATION, USE_LOCAL_FILES_AND_NO_LOGIN } from '../../../constants';
import localJsonFile from '../../../config/MauiA.json';
import { MergeModes } from '../../util/enums/MergeModes';

export const extractErrorMessage = (error: string): string => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    console.error(error);
    return errorMsg;
}

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, unknown> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const [originalJsonConfig, setOriginalJsonConfig] = useState<any | null>(null);
    const [showMerge, setShowMerge] = useState<boolean>(false);
    const compareJsons = useRef<{ originalConfig: string, editedConfig: string }>();
    const handleOkMerge = useRef<any>(() => { console.log('not set'); });
    const handleCancelMerge = useRef<any>(() => null);
    const diffMode = useRef<MergeModes>();

    const loadJsonConfigs = async (jsonConfigId?: number | null, resolvedJson?: any) => {
        const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => response)
            .catch(error => {
                message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                if (USE_LOCAL_FILES_AND_NO_LOGIN) {
                    const map = new Map().set(123, { id: 123, data: localJsonFile });
                    setJsonConfigMap(map);
                }
            });
        setJsonConfigMap(jsonConfigs);

        if (jsonConfigId) {
            setSelectedJsonConfig(jsonConfigId, jsonConfigs, resolvedJson);
        }
    }

    // call with undefind values to create new json config
    const setSelectedJsonConfig = (jsonConfigId: number | null, jsonConfigs?: Map<number, unknown> | null, resolvedJson?: any) => {
        if (jsonConfigId) {
            let selectedJsonConfig;
            if (jsonConfigs) {
                selectedJsonConfig = jsonConfigs.get(jsonConfigId);
            }
            else if (jsonConfigMap && jsonConfigMap.size > 0) {
                selectedJsonConfig = jsonConfigMap.get(jsonConfigId);
            }

            // set new json config and Original
            if (selectedJsonConfig) {
                setJsonConfig(selectedJsonConfig as JsonConfig);
                setOriginalJsonConfig((selectedJsonConfig as JsonConfig).data);
            }
            // overide if it has resolved version
            if (resolvedJson) {
                setJsonConfig({
                    data: resolvedJson
                } as JsonConfig);
            }
            setSelectedJsonConfigId(jsonConfigId);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedJsonConfigId(null);
            setOriginalJsonConfig(null);
        }
        JsonConfigCommandCenter.updateTitle();
    }

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { originalConfig: options.originalConfig, editedConfig: options.editedConfig };
        diffMode.current = options.diffMode;
        handleOkMerge.current = options.onOk;
        handleCancelMerge.current = options.onCancel;
        setShowMerge(true);
    }

    const reloadJsonConfigs = (jsonConfigId: number | null) => {
        loadJsonConfigs(jsonConfigId);
    }

    JsonConfigCommandCenter.getOriginalJsonConfig = () => {
        return originalJsonConfig;
    };

    const onCommand = async (command: CommandEvent, ...args: any[]): Promise<any> => {
        switch (command) {
            case CommandEvent.mode: {
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.reload: {
                loadJsonConfigs(selectedJsonConfigId, args[0]);
                break;
            }
            case CommandEvent.switchConfig: {
                setSelectedJsonConfig(args[0]);
                break;
            }
            case CommandEvent.saveAs: {
                return await JsonConfigCommandCenter.onSaveAs();
            }
            case CommandEvent.update: {
                return await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId, args[0]);
            }
            case CommandEvent.delete: {
                return await JsonConfigCommandCenter.onDelete(selectedJsonConfigId);
            }
            case CommandEvent.download: {
                JsonConfigCommandCenter.onDownload();
                break;
            }
            case CommandEvent.diff: {
                setJsonConfig({ data: args[0] } as JsonConfig);
                break;
            }
            default:
                break;
        }
    }

    useEffect(() => {
        window.addEventListener("beforeunload", function (e) {
            if (JsonConfigCommandCenter.isEdited()) {
                (e || window.event).returnValue = true; //Gecko + IE
                return true; //Gecko + Webkit, Safari, Chrome etc.
            }
            return false;
        });
    }, []);

    useEffect(() => {
        loadJsonConfigs();
    }, []);

    return (
        <div className={classes.configurator}>
            <div className={classes.sideNavPanel}>
                <SideNavPanel
                    commandEvent={onCommand}
                    jsonConfigMap={jsonConfigMap}
                    selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.fullEditor}>
                <div className={classes.editorCommandContainer}>
                    <CommandPanel
                        commandEvent={onCommand}
                        reloadJsonConfigs={reloadJsonConfigs}
                        setMergeOptions={setMergeOptions}
                        selectedJsonConfigId={selectedJsonConfigId}
                    />
                    <EditorPanel jsonConfig={jsonConfig} />
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
