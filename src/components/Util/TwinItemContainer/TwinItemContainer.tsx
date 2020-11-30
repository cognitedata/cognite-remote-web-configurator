import React, { useEffect, useState } from 'react';
import classes from './TwinItemContainer.module.scss';
import { List } from 'antd';
import { CogniteClient } from "@cognite/sdk";

const onClickHandler = (onClick?: () => void) => {
    if (!onClick) {
        console.warn("function is not implemented");
    }
    else {
        onClick();
    }
}

export const TwinItemContainer: React.FC<{ sdk: CogniteClient, onClick?: () => void }> = (props) => {

    const [digitalTwins, setDigitalTwins]= useState<any[]>([]);
    useEffect(()=>{
        (async ()=> {
            const response = await props.sdk.get(`${props.sdk.getBaseUrl()}/api/playground/projects/${props.sdk.project}/twins`);
            if(response) {
                const twins = response.data.data?.items;
                const twinNames = twins.map((twin: { id: number, data: { header: { name: string }}}) => twin?.data?.header?.name || twin.id);
                setDigitalTwins(twinNames);
            }
        })();
    },[]);

    if(digitalTwins.length){
        return (
            <List
                bordered
                dataSource={digitalTwins}
                renderItem={item => (
                    <List.Item className={classes.twinItem} onClick={() => onClickHandler(props.onClick)}>
                        {item}
                    </List.Item>
                )}
            />
        );
    } else {
        return null;
    }
}
