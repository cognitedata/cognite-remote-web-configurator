import React from 'react';
import classes from './ConfigSelector.module.scss';
import List from 'antd/es/list';

export const ConfigSelector: React.FC<{
    onJsonConfigSelectHandler: (id: number | null) => void,
    jsonConfigMap: Map<number, unknown> | null,
    selectedJsonConfigId: number | null
}> = (props) => {

    const jsonConfigs: { id: number, name: string }[] = [];

    props.jsonConfigMap?.forEach((element: any) => {
        jsonConfigs.push({
            id: element.id,
            name: element.data?.header?.name
        });
    });

    if (jsonConfigs.length) {
        return (
            <List
                bordered
                dataSource={jsonConfigs}
                renderItem={item => (
                    <List.Item
                        className={`${classes.jsonConfigItem} ` + (item.id === props.selectedJsonConfigId ? classes.selected : "")}
                        onClick={() => props.onJsonConfigSelectHandler(item.id)}
                        key={item.id}
                    >
                        {item.name}
                    </List.Item>
                )}
            />
        );
    } else {
        return null;
    }
}
