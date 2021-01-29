import React from 'react';
import Button from "antd/es/button";
import styles from "./CommandItem.module.scss";

export const CommandItem: React.FC<{ className?: string, onClick?: () => void, icon?: string, loading?: boolean }> = (props) => {
    return (
        <Button
            type="primary"
            className={`${styles.commandBtn} ${props.className}`}
            size="large"
            icon={props.loading ? '' : props.icon}
            onClick={props.onClick}
            loading={props.loading}
        >
            {props.children}
        </Button>
    );
}
