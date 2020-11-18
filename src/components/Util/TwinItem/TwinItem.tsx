import React from 'react';
import classes from './TwinItem.module.scss';

const onClickHandler = (onClick?: () => void) => {
    if (!onClick) {
        console.warn("function is not implemented");
    }
    else {
        onClick();
    }
}

export const TwinItem: React.FC<{ twinItem: string, onClick?: () => void }> = (props) => {
    return (
        <div className={classes.twinItem} onClick={() => onClickHandler(props.onClick)}>
            {props.twinItem}
        </div>
    );
}
