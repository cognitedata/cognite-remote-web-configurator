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
    const [selectedTwinName, setSelectedTwinName] = useState<any>();
    const digitalTwinConfigMap = useRef<Map<string, unknown> | null>(null);
    const [jsonConfig, setJsonConfig] = useState<JsonConfig | null>(null);

    // call with undefind values to create new config
    const onJsonConfigSelect = (configName: string) => {
        if (configName) {
            setSelectedTwinName(configName);
            const configMap = digitalTwinConfigMap.current;
            if (configMap && configMap.size > 0) {
                const config = configMap.get(configName);
                if (config) {
                    setJsonConfig(config as JsonConfig);
                    setSelectedTwinName(configName);
                }
            }
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedTwinName(null);
        }
    }

    const loadDigitalTwins = () => {
        JsonConfigCommandCenter.loadDigitalTwins(setDigitalTwinNames, digitalTwinConfigMap);
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
