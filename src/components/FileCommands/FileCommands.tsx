import React from 'react';
import classes from './FileCommands.module.scss';

export const FileCommands: React.FC<any> = () => {
    return (
        <div className={classes.commandsContainer}>
            <div className={classes.commandItem}>DELETE</div>
            <div className={classes.commandItem}>UPDATE</div>
        </div>
    );
}
