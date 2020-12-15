import React, { useEffect, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfigMap, setJsonConfigMap] = useState<Map<number, unknown> | null>(null);
    const [selectedJsonConfigId, setSelectedJsonConfigId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);

    const loadJsonConfigs = () => {
        JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => {
                setJsonConfigMap(response);
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
            case CommandEvent.update: {
                JsonConfigCommandCenter.onUpdate(selectedJsonConfigId, reloadJsonConfigs);
                break;
            }
            case CommandEvent.delete: {
                JsonConfigCommandCenter.onDelete(selectedJsonConfigId, reloadJsonConfigs);
                break;
            }
            case CommandEvent.saveAs: {
                return await JsonConfigCommandCenter.onSaveAs()
                // .then(response => {
                //     const createdId = response.data.data.items[0].id;
                //     reloadJsonConfigs(createdId);
                //     alert("Data saved successfully!");
                // })
                // .catch(error => {
                //     JsonConfigCommandCenter.errorAlert("Save Cancelled!", error);
                // });
                break;
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
                    onJsonConfigSelect={onJsonConfigSelect}
                    jsonConfigMap={jsonConfigMap}
                    selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.commandPanel}>
                <CommandPanel
                    commandEvent={onCommand}
                    reloadJsonConfigs={reloadJsonConfigs}
                    selectedJsonConfigId={selectedJsonConfigId}
                />
            </div>
            <div className={classes.editorPanel}>
                <EditorPanel jsonConfig={jsonConfig} />
            </div>
        </div>
    );
}
