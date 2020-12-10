import React from 'react';
import classes from './ConfigSelector.module.scss';
import { List } from 'antd';

export const ConfigSelector: React.FC<{
    onClick: (configId: number) => void,
    digitalTwinConfigMap: Map<number, unknown> | null,
    selectedTwinId: number | null
}> = (props) => {

    const digitalTwins: { id: number, name: string }[] = [];

    props.digitalTwinConfigMap?.forEach((element: any) => {
        digitalTwins.push({
            id: element.id,
            name: element.data?.header?.name
        });

    });

    if (digitalTwins.length) {
        return (
            <List
                bordered
                dataSource={digitalTwins}
                renderItem={item => (
                    <List.Item className={`${classes.twinItem} ` + (item.id === props.selectedTwinId ? classes.selected : "")} onClick={() => props.onClick(item.id)} key={item.id}>
                        {item.name}
                    </List.Item>
                )}
            />
        );
    } else {
        return null;
    }
}
