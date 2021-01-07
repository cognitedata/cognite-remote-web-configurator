import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import { ConfigSelector } from '../../components/ConfigSelector/ConfigSelector';
import Divider from "antd/es/divider";
import Text from "antd/es/typography/Text";
import { CommandEvent } from '../../util/Interfaces/CommandEvent';
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { LOCALIZATION } from '../../../constants';

const { confirm } = Modal;

export const SideNavPanel: React.FC<{
    commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void,
    jsonConfigMap: Map<number, unknown> | null,
    selectedJsonConfigId: number | null
}> = (props: any) => {

    const onJsonConfigSelectHandler = (id: number | null) => {
        if (JsonConfigCommandCenter.isEdited()) {
            confirm({
                title: LOCALIZATION.SWITCH_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.SWITCH_CONTENT,
                onOk() {
                    props.commandEvent(CommandEvent.switchConfig, id);
                }
            });
        }
        else {
            props.commandEvent(CommandEvent.switchConfig, id);
        }
    }

    return (
        <>
            <div className={classes.top}>
                <div>
                    <img alt="cognite-logo" src={logo} className={classes.logo} />
                </div>
                <Text strong className={classes.title}>Cognite Remote Configurator</Text>
            </div>
            <Divider />
            <div className={classes.createNewBtn}>
                <CommandItem className={classes.btn} icon={"plus"} onClick={() => onJsonConfigSelectHandler(null)}>Create New</CommandItem>
            </div>
            <div>
                <Text strong>Configurations</Text>
                <div className={classes.jsonConfigContainer}>
                    <ConfigSelector
                        onJsonConfigSelectHandler={onJsonConfigSelectHandler}
                        jsonConfigMap={props.jsonConfigMap}
                        selectedJsonConfigId={props.selectedJsonConfigId}
                        jsonConfigHash={props.jsonConfigHash}
                    />
                </div>
            </div>
        </>
    );
}
