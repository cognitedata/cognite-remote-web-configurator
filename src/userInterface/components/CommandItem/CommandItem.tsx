import React from 'react';
import Button from "antd/es/button";
import styles from "./CommandItem.module.scss";
import Spin from 'antd/es/spin';

export const CommandItem: React.FC<{ className?: string, onClick?: () => void, icon?: string, loading?: boolean }> = (props) => {
    console.log('asd loading:', props.loading);
    const buttonProps = props.loading ?
        {
            disabled: true
        } :
        {
            icon: props.icon,
            onClick: props.onClick
        }

    return (
        <Button
            type="primary"
            className={`${styles.commandBtn} ${props.className}`}
            size="large"
            {...buttonProps}
        >
            {props.loading ? <Spin size="small"/> : props.children}
        </Button>
    );
}
