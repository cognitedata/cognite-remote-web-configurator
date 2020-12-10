import React, { useEffect, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';

export const JsonConfigurator: React.FC<any> = () => {
    const [digitalTwinConfigMap, setDigitalTwinConfigMap] = useState<Map<number, unknown> | null>(null);
    const [selectedTwinId, setSelectedTwinId] = useState<number | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);

    const loadDigitalTwins = () => {
        JsonConfigCommandCenter.loadDigitalTwins(setDigitalTwinConfigMap);
    }

    // call with undefind values to create new config
    const onJsonConfigSelect = (configId: number) => {
        JsonConfigCommandCenter.onJsonConfigSelect(configId, digitalTwinConfigMap, setSelectedTwinId, setJsonConfig);
    }

    const reloadSavedTwin = (configId: number) => {
        JsonConfigCommandCenter.loadDigitalTwins(setDigitalTwinConfigMap);
        JsonConfigCommandCenter.onJsonConfigSelect(configId, digitalTwinConfigMap, setSelectedTwinId, setJsonConfig);
    }

    const onCommand = (command: CommandEvent, ...args: any[]) => {
        switch (command) {
            case CommandEvent.mode: {
                JsonConfigCommandCenter.onModeChange(args[0]);
                break;
            }
            case CommandEvent.update: {
                JsonConfigCommandCenter.onUpdate();
                break;
            }
            case CommandEvent.delete: {
                JsonConfigCommandCenter.onDelete();
                break;
            }
            case CommandEvent.saveAs: {
                JsonConfigCommandCenter.onSaveAs(reloadSavedTwin);
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
        loadDigitalTwins();

    }, []);

    return (
        <div className={classes.configurator}>
            <div className={classes.sideNavPanel}>
                <SideNavPanel
                    onTwinSelect={onJsonConfigSelect}
                    digitalTwinConfigMap={digitalTwinConfigMap}
                    selectedTwinId={selectedTwinId} />
            </div>
            <div className={classes.commandPanel}>
                <CommandPanel commandEvent={onCommand} selectedTwinId={selectedTwinId} />
            </div>
            <div className={classes.editorPanel}>
                <EditorPanel jsonConfig={jsonConfig} />
            </div>
        </div>
    );
}
