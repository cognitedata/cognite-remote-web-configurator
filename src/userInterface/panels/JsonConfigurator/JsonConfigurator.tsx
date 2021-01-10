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

    const loadJsonConfigs = async (jsonConfigId?: number | null, resolvedJson?: any) => {
        const jsonConfigs = await JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => response)
            .catch(error => {
                message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
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

            // set new json config and hash
            if (selectedJsonConfig) {
                setJsonConfig(selectedJsonConfig as JsonConfig);
                setJsonConfigHash(hash((selectedJsonConfig as JsonConfig).data));
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
            setJsonConfigHash(null);
        }
        JsonConfigCommandCenter.updateTitle();
    }

    const setMergeOptions = (options: MergeOptions) => {
        compareJsons.current = { currentJson: options.localConfig, newJson: options.serverConfig };
        handleOkMerge.current = options.onOk;
        handleCancelMerge.current = options.onCancel;
        setShowMerge(true);
    }

    const reloadJsonConfigs = (jsonConfigId: number | null) => {
        loadJsonConfigs(jsonConfigId);
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
