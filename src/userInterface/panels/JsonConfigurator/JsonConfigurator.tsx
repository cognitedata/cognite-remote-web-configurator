import React, { useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { JsonConfig } from "../../util/types";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { JsonConfigCommandCenter } from "../../util/JsonConfigCommandCenter";
import { CommandPanel } from "../CommandPanel/CommandPanel";
import { SideNavPanel } from '../SideNavPanel/SideNavPanel';
import { EditorPanel } from '../EditorPanel/EditorPanel';

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfig, setJsonConfig] = useState<null | JsonConfig>(null);

    const onJsonConfigSelect = (config: JsonConfig) => {
        if(config){
            setJsonConfig(config);
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
            <div className={classes.leftbar}><SideNavPanel onTwinSelect={onJsonConfigSelect}/></div>
            <div className={classes.fileCommands}><CommandPanel commandEvent={onCommand}/></div>
            <div className={classes.jsonView}><EditorPanel jsonConfig={jsonConfig}/></div>
        </div>
    );
}
