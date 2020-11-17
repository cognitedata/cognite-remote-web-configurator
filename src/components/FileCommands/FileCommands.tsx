import React from 'react';
import classes from './FileCommands.module.scss';
import { CommandItem } from '../Util/CommandItem/CommandItem';

export const FileCommands: React.FC<any> = () => {
    return (
        <div className={classes.commandsContainer}>
            <CommandItem><i className="fa fa-trash"></i> DELETE</CommandItem>
            <CommandItem><i className="fa fa-upload"></i> UPDATE</CommandItem>
        </div>
    );
}
