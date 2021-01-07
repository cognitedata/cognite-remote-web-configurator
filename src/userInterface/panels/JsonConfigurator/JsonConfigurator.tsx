import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig, MergeOptions } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';
import message from 'antd/es/message';
import { LOCALIZATION } from '../../../constants';
import hash from 'object-hash';
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
    const [jsonConfigHash, setJsonConfigHash] = useState<string | null>(null);
    const [showMerge, setShowMerge] = useState<boolean>(false);
    const compareJsons = useRef<{ currentJson: string, newJson: string }>();
    const handleOkMerge = useRef<any>(() => { console.log('not set'); });
    const handleCancelMerge = useRef<any>(() => null);

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
    const setSelectedJsonConfig = (jsonConfigId: number | null) => {
        if (jsonConfigId) {
            if (jsonConfigMap && jsonConfigMap.size > 0) {
                const selectedJsonConfig = jsonConfigMap.get(jsonConfigId);
                if (selectedJsonConfig) {
                    setJsonConfig(selectedJsonConfig as JsonConfig);
                    setJsonConfigHash(hash((selectedJsonConfig as JsonConfig).data));
                }
            }
            setSelectedJsonConfigId(jsonConfigId);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedJsonConfigId(null);
            setJsonConfigHash(null);
        }
    }

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { currentJson: options.localConfig, newJson: options.serverConfig };
        handleOkMerge.current = options.onOk;
        handleCancelMerge.current = options.onCancel;
        setShowMerge(true);
    }

    // const handleCancelMerge = () => {
    //     message.error(LOCALIZATION.REFRESH_ERROR.replace('{{error}}', ''));
    //     setShowMerge(false);
    // }

    // const handleOkMerge = (mergedJsonString: string) => {
    //     setShowMerge(false);
    //     let mergedJson;
    //     try{
    //         mergedJson = JSON.parse(mergedJsonString);
    //         mergedJson = { id: selectedJsonConfigId, data: mergedJson };
    //     } catch (e: any) {
    //         console.error("Error Occurred while parsing json!");
    //     }

    //     if(jsonConfigMap && mergedJson) {
    //         if(selectedJsonConfigId && jsonConfigMap.has(selectedJsonConfigId) ) {
    //             jsonConfigMap.set(selectedJsonConfigId, mergedJson);
    //             setJsonConfig(mergedJson as JsonConfig);
    //         }
    //         message.success(LOCALIZATION.REFRESH_SUCCESS);
    //     }
    // }

    const reloadJsonConfigs = (jsonConfigId: number | null) => {
        loadJsonConfigs();
        setSelectedJsonConfig(null);
        setSelectedJsonConfig(jsonConfigId);
    }

    JsonConfigCommandCenter.getOriginalHash = () => {
        return jsonConfigHash;
    };

    const onCommand = async (command: CommandEvent, ...args: any[]): Promise<any> => {
        switch (command) {
            case CommandEvent.mode: {
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.reload: {
                loadJsonConfigs();
                setJsonConfig(args[0]);
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
            // case CommandEvent.refresh: {
            //     const serverData = await JsonConfigCommandCenter.onRefresh(selectedJsonConfigId);
            //     const serverConfig = serverData.data;
            //     const localConfig = JsonConfigCommandCenter.currentJson;

            //     if (serverConfig && localConfig) {
            //         if (JSON.stringify(serverConfig) !== JSON.stringify(localConfig)) {
            //             compareJsons.current = { currentJson: localConfig, newJson: serverConfig };
            //             setShowMerge(true);
            //         } else {
            //             if (jsonConfigMap && serverConfig) {
            //                 if (selectedJsonConfigId && jsonConfigMap.has(selectedJsonConfigId)) {
            //                     jsonConfigMap.set(selectedJsonConfigId, serverConfig);
            //                     setJsonConfig(serverConfig);
            //                     message.success(LOCALIZATION.REFRESH_SUCCESS);
            //                 }
            //             }
            //         }
            //     } else {
            //         console.error("Server config or local config cannot be empty!");
            //     }
            //     break;
            // }
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
                <DiffMerge
                    setShowMerge={setShowMerge}
                    showPopup={showMerge}
                    serverJson={compareJsons.current?.newJson}
                    localJson={compareJsons.current?.currentJson}
                    onMerge={handleOkMerge.current}
                    onCancel={handleCancelMerge.current}
                />
            </div>
        </div>
    );
}
