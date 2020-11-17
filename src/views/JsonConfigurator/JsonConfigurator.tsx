import React from 'react';
import classes from './JsonConfigurator.module.scss'
import { TwinSelector } from '../../components/TwinSelector/TwinSelector';
import { FileCommands } from '../../components/FileCommands/FileCommands';
import { JsonEditor } from '../../components/JsonEditor/JsonEditor';

export const JsonConfigurator: React.FC<any> = () => {
    return (
        <div className={classes.configurator}>
            <div className={classes.leftbar}><TwinSelector /></div>
            <div className={classes.fileCommands}><FileCommands /></div>
            <div className={classes.jsonView}><JsonEditor /></div>
        </div>
    );
}