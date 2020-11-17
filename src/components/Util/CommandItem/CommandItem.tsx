import React from 'react';
import classes from './CommandItem.module.scss';

const onClickHandler = (onClick?: () => void) => {
    if(!onClick){
        console.warn("function is not implemented");
    }
    else{
        onClick();
    }
}

export const CommandItem: React.FC<{ onClick?: () => void }> = (props) => {
    return (
        <div className={classes.commandItem} onClick={()=>onClickHandler(props.onClick)}>
            {props.children}
        </div>
    );
}
