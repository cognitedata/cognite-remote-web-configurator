import React from 'react';
import classes from './FileCommands.module.scss';
import { CommandItem } from '../Util/CommandItem/CommandItem';

export const FileCommands: React.FC<any> = () => {
    return (
        <div className={classes.commandsContainer}>
            <CommandItem icon={"delete"}>DELETE</CommandItem>
            <CommandItem icon={"upload"}>UPDATE</CommandItem>
        </div>
    );
}
