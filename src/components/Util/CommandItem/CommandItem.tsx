import React from 'react';
import classes from './CommandItem.module.scss';

export const CommandItem: React.FC = (props) => {
    return (
        <div className={classes.commandItem}>
            {props.children}
        </div>
    );
}
