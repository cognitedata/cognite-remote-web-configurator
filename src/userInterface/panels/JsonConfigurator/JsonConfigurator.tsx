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
        JsonConfigCommandCenter.loadJsonConfigs(setJsonConfigMap);
    }

    // call with undefind values to create new json config
    const onJsonConfigSelect = (jsonConfigId: number | null) => {
        JsonConfigCommandCenter.onJsonConfigSelect(jsonConfigId, jsonConfigMap, setSelectedJsonConfigId, setJsonConfig);
    }

    const reloadJsonConfigs = (jsonConfigId: number | null) => {
        loadJsonConfigs();
        onJsonConfigSelect(jsonConfigId);
    }

    const onCommand = (command: CommandEvent, ...args: any[]) => {
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
                JsonConfigCommandCenter.onSaveAs(reloadJsonConfigs);
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
                <CommandPanel commandEvent={onCommand} selectedJsonConfigId={selectedJsonConfigId} />
            </div>
            <div className={classes.editorPanel}>
                <EditorPanel jsonConfig={jsonConfig} />
            </div>
        </div>
    );
}
