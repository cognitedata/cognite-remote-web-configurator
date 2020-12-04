import React, { useEffect, useRef, useState } from 'react';
import classes from './TwinItemContainer.module.scss';
import { List } from 'antd';
import { CogniteClient } from "@cognite/sdk";

export const TwinItemContainer: React.FC<{ sdk: CogniteClient, onClick: (item: any) => void }> = (props) => {

    const [digitalTwins, setDigitalTwins]= useState<any[]>([]);
    const digitalTwinConfigMap = useRef<Map<string, unknown> | null>(null);
    useEffect(()=>{
        (async ()=> {
            const response = await props.sdk.get(`${props.sdk.getBaseUrl()}/api/playground/projects/${props.sdk.project}/twins`);
            if(response) {
                const twins = response.data.data?.items;
                const twinNames = [];
                const twinMap = new Map();

                for(const twin of twins) {
                    const twinName = twin?.data?.header?.name || twin.id;
                    twinNames.push(twinName);
                    twinMap.set(twinName, twin);
                }
                setDigitalTwins(twinNames);
                digitalTwinConfigMap.current = twinMap;
            }
        })();
    },[]);

    const onListItemClick = (configName: string) => {
        const configMap = digitalTwinConfigMap.current;
        if(configMap && configMap.size > 0) {
            const config = configMap.get(configName);
            props.onClick(config);
        }
    }

    if(digitalTwins.length){
        return (
            <List
                bordered
                dataSource={digitalTwins}
                renderItem={item => (
                    <List.Item className={`${classes.twinItem}`} onClick={() => onListItemClick(item)} key={item}>
                        {item}
                    </List.Item>
                )}
            />
        );
    } else {
        return null;
    }
}
