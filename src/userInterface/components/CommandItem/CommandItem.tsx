import React from 'react';
import Button from "antd/es/button";
import styles from "./CommandItem.module.scss";
import Spin from 'antd/es/spin';

export const CommandItem: React.FC<{ className?: string, onClick?: () => void, icon?: string, loading?: boolean }> = (props) => {
    return (
        <Button
            type="primary"
            className={`${styles.commandBtn} ${props.className}`}
            size="large"
            icon={props.loading ? '' : props.icon}
            onClick={props.loading ? () => { console.log('asd') } : props.onClick}
            disabled={props.loading}
        >
            {props.loading ? <Spin size="small" /> : props.children}
        </Button>
    );
}
