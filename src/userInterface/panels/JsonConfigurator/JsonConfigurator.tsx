import React, { useEffect, useRef, useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';

export const JsonConfigurator: React.FC<any> = () => {
    const [digitalTwinNames, setDigitalTwinNames] = useState<string[]>([]);
    const [selectedTwinName, setSelectedTwinName] = useState<string | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);
    const digitalTwinConfigMap = useRef<Map<string, unknown> | null>(null);

    const loadDigitalTwins = () => {
        JsonConfigCommandCenter.loadDigitalTwins(setDigitalTwinNames, digitalTwinConfigMap);
    }

    // call with undefind values to create new config
    const onJsonConfigSelect = (configName: string) => {
        JsonConfigCommandCenter.onJsonConfigSelect(configName, digitalTwinConfigMap, setSelectedTwinName, setJsonConfig);
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
                JsonConfigCommandCenter.onSaveAs(loadDigitalTwins);
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
            <div className={classes.leftbar}><SideNavPanel onTwinSelect={onJsonConfigSelect} digitalTwinNames={digitalTwinNames} selectedTwinName={selectedTwinName} /></div>
            <div className={classes.fileCommands}><CommandPanel commandEvent={onCommand} selectedTwinName={selectedTwinName} /></div>
            <div className={classes.jsonView}><EditorPanel jsonConfig={jsonConfig} /></div>
        </div>
    );
}
