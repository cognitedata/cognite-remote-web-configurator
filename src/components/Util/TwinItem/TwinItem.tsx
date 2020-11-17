import React from 'react';
import classes from './TwinItem.module.scss';

export const TwinItem: React.FC<{twinItem: string}> = (props) => {
    return <div className={classes.twinItem}>{props.twinItem}</div>
}