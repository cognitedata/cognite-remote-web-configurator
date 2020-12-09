import React, { useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfig, setJsonConfig] = useState<null | JsonConfig>(null);
    const [selectedTwin, setSelectedTwin] = useState<any>();
    // const [fileMode, setFileMode] = useState<"NEW" | "EDIT">("NEW");


    // call with undefind values to create new config
    const onJsonConfigSelect = (configName?: string, config?: JsonConfig) => {

        if (configName && config) {
            setJsonConfig(config);
            setSelectedTwin(configName);
        }
        else {
            setJsonConfig({
                data: {}
            } as JsonConfig);
            setSelectedTwin(null);
        }
    }

    const onCommand = (command: CommandEvent, ...args: any[]) => {
        switch (command) {
            case CommandEvent.Mode: {
                JsonConfigCommandCenter.onModeChange(args[0]);
            }
        }
    }

    return (
        <div className={classes.configurator}>
            <div className={classes.leftbar}><SideNavPanel onTwinSelect={onJsonConfigSelect} selectedTwin={selectedTwin} /></div>
            <div className={classes.fileCommands}><CommandPanel commandEvent={onCommand} selectedTwin={selectedTwin} /></div>
            <div className={classes.jsonView}><EditorPanel jsonConfig={jsonConfig} /></div>
        </div>
    );
}
