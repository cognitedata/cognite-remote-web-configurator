import React, { useState } from 'react';
import classes from './JsonConfigurator.module.scss'
import { TwinSelector } from '../../components/TwinSelector/TwinSelector';
import { FileCommands } from '../../components/FileCommands/FileCommands';
import { JsonEditor } from '../../components/JsonEditor/JsonEditor';
import { JsonConfig } from "../../types";

export const JsonConfigurator: React.FC<any> = () => {
    const [jsonConfig, setJsonConfig] = useState<null | JsonConfig>(null);

    const onJsonConfigSelect = (config: JsonConfig) => {
        if(config){
            setJsonConfig(config);
        }
    }

    return (
        <div className={classes.configurator}>
            <div className={classes.leftbar}><TwinSelector onTwinSelect={onJsonConfigSelect}/></div>
            <div className={classes.fileCommands}><FileCommands /></div>
            <div className={classes.jsonView}><JsonEditor jsonConfig={jsonConfig}/></div>
        </div>
    );
}
