import React from 'react';
import Button from "antd/es/button";
import styles from "./CommandItem.module.scss";

export const CommandItem: React.FC<{ className?: string, onClick?: () => void, icon?: string }> = (props) => {
    return (<Button type="primary" className={`${styles.commandBtn} ${props.className}`}
                    icon={props.icon}
                    size="large"
                    onClick={props.onClick}>
            {props.children}
    </Button>);
}
