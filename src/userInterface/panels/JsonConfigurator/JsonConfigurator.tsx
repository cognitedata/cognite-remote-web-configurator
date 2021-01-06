import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';
import message from 'antd/es/message';
import { LOCALIZATION } from '../../../constants';
import { DiffMerge } from "../../components/DiffMerge/DiffMerge";

export const extractErrorMessage = (error: string): string => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    console.error(error);
    return errorMsg;
}

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, unknown> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const [showMerge, setShowMerge] = useState(false);
    const compareJsons = useRef<{ currentJson: string, newJson: string}>();

    const loadJsonConfigs = () => {
        JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => {
                setJsonConfigMap(response);
            })
            .catch(error => {
                message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
            });
    }

    // call with undefind values to create new json config
    const onJsonConfigSelect = (jsonConfigId: number | null) => {
        if (jsonConfigId) {
            if (jsonConfigMap && jsonConfigMap.size > 0) {
                const jsonConfig = jsonConfigMap.get(jsonConfigId);
                if (jsonConfig) {
                    setJsonConfig(jsonConfig as JsonConfig);
                }
            }
            setSelectedJsonConfigId(jsonConfigId);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedJsonConfigId(null);
        }
    }

    const handleCancelMerge = () => {
        message.error(LOCALIZATION.REFRESH_ERROR.replace('{{error}}', ''));
        setShowMerge(false);
    }

    const handleOkMerge = (mergedJsonString: string) => {
        setShowMerge(false);
        let mergedJson;
        try{
            mergedJson = JSON.parse(mergedJsonString);
            mergedJson = { id: selectedJsonConfigId, data: mergedJson };
        } catch (e: any) {
            console.error("Error Occurred while parsing json!");
        }

        if(jsonConfigMap && mergedJson) {
            if(selectedJsonConfigId && jsonConfigMap.has(selectedJsonConfigId) ) {
                jsonConfigMap.set(selectedJsonConfigId, mergedJson);
                setJsonConfig(mergedJson as JsonConfig);
            }
            message.success(LOCALIZATION.REFRESH_SUCCESS);
        }
    }

    const reloadJsonConfigs = (jsonConfigId: number | null) => {
        loadJsonConfigs();
        onJsonConfigSelect(jsonConfigId);
    }

    const onCommand = async (command: CommandEvent, ...args: any[]): Promise<any> => {
        switch (command) {
            case CommandEvent.mode: {
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.createNew: {
                onJsonConfigSelect(args[0]);
                break;
            }
            case CommandEvent.saveAs: {
                return await JsonConfigCommandCenter.onSaveAs();
            }
            case CommandEvent.update: {
                return await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId);
            }
            case CommandEvent.delete: {
                return await JsonConfigCommandCenter.onDelete(selectedJsonConfigId);
            }
            case CommandEvent.download: {
                JsonConfigCommandCenter.onDownload();
                break;
            }
            case CommandEvent.refresh: {
                const serverData = await JsonConfigCommandCenter.onRefresh(selectedJsonConfigId);
                const serverConfig = serverData.data;
                const localConfig = JsonConfigCommandCenter.currentJson;

                if(serverConfig && localConfig) {
                    if(JSON.stringify(serverConfig) !== JSON.stringify(localConfig)) {
                        compareJsons.current = { currentJson: localConfig, newJson: serverConfig };
                        setShowMerge(true);
                    } else {
                        if(jsonConfigMap && serverConfig) {
                            if(selectedJsonConfigId && jsonConfigMap.has(selectedJsonConfigId) ) {
                                jsonConfigMap.set(selectedJsonConfigId, serverConfig);
                                setJsonConfig(serverConfig);
                                message.success(LOCALIZATION.REFRESH_SUCCESS);
                            }
                        }
                    }
                } else{
                    console.error("Server config or local config cannot be empty!");
                }
                break;
            }
            default:
                break;
        }
    }

    useEffect(() => {
        loadJsonConfigs();

    }, []);

    return (
        <div className={classes.configurator}>
            <div className={classes.sideNavPanel}>
                <SideNavPanel
                    onJsonConfigSelect={onJsonConfigSelect}
                    commandEvent={onCommand}
                    jsonConfigMap={jsonConfigMap}
                    selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.fullEditor}>
                <div className={classes.editorCommandContainer}>
                    <CommandPanel
                        commandEvent={onCommand}
                        reloadJsonConfigs={reloadJsonConfigs}
                        selectedJsonConfigId={selectedJsonConfigId}
                    />
                    <EditorPanel jsonConfig={jsonConfig} />
                </div>
            </div>
            <div>
                <DiffMerge showPopup={showMerge} serverJson={compareJsons.current?.newJson} localJson={compareJsons.current?.currentJson} onMerge={handleOkMerge} onCancel={handleCancelMerge} />
            </div>
        </div>
    );
}
