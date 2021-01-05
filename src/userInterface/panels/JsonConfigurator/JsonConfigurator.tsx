import React, { useEffect, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';
import message from 'antd/es/message';
import { LOCALIZATION } from '../../../constants';
import hash from 'object-hash';

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

    const loadJsonConfigs = () => {
        return JsonConfigCommandCenter.loadJsonConfigs()
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
                setSelectedJsonConfig(args[0]);
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
                return await JsonConfigCommandCenter.onUpdate(selectedJsonConfigId);
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
                        selectedJsonConfigId={selectedJsonConfigId}
                    />
                    <EditorPanel jsonConfig={jsonConfig} />
                </div>
            </div>
        </div>
    );
}
