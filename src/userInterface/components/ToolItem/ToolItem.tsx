import React from 'react';
import Button from "antd/es/button";
import classes from "./ToolItem.module.scss";

export const ToolItem: React.FC<{ onClick?: () => void, icon?: string }> = (props) => {
    return (
        <div className={classes.tool}>
            <Button
                type="primary"
                className={`${classes.btn}`}
                size="small"
                onClick={props.onClick} >
                {props.children}
            </Button>
        </div>
    );
}
