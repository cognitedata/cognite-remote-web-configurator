import React from 'react';
import classes from './ConfigSelector.module.scss';
import { List } from 'antd';

export const ConfigSelector: React.FC<{ onClick: (configName: string) => void, digitalTwinNames: string[], selectedTwinName: string | null }> = (props) => {

    if (props.digitalTwinNames.length) {
        return (
            <List
                bordered
                dataSource={props.digitalTwinNames}
                renderItem={item => (
                    <List.Item className={`${classes.twinItem} ` + (item === props.selectedTwinName ? classes.selected : "")} onClick={() => props.onClick(item)} key={item}>
                        {item}
                    </List.Item>
                )}
            />
        );
    } else {
        return null;
    }
}
