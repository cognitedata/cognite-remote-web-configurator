import React from 'react';
import Button from "antd/es/button";
import styles from "./CommandItem.module.scss";

export const CommandItem: React.FC<{ onClick?: () => void, icon?: string }> = (props) => {
    return (<Button type="primary" className={styles.commandBtn}
                    shape="round"
                    icon={props.icon}
                    size="large"
                    onClick={props.onClick}>
            {props.children}
    </Button>);
}
