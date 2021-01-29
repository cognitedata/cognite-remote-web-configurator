import React from 'react';
import classes from './SideNavPanel.module.scss';
import logo from "../../../assets/cognite.png";
import Divider from "antd/es/divider";
import Text from "antd/es/typography/Text";
import Modal from 'antd/es/modal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import * as yaml from "js-yaml";
import { CommandEvent } from '../../util/Interfaces/CommandEvent';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { ConfigSelector } from '../../components/ConfigSelector/ConfigSelector';
import { FileUploader } from '../../components/FileUploader/FileUploader';
import { LOCALIZATION } from '../../../constants';
import { JsonConfigCommandCenter } from "../../../core/JsonConfigCommandCenter";

const { confirm } = Modal;

export const SideNavPanel: React.FC<{
    isEdited: boolean,
    commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void,
    jsonConfigMap: Map<number, unknown> | null,
    selectedJsonConfigId: number | null
}> = (props: any) => {

    const onJsonConfigSelectHandler = (id: number | null) => {
        if (props.isEdited) {
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

    const onUpload = (e: any) => {
        const reader = new FileReader();
        const file = e.originFileObj;
        reader.onload = () => {
            try {
                const yamlObj = yaml.load(reader.result as string);
                props.commandEvent(CommandEvent.loadSchema, yamlObj);
            } catch (e) {
                JsonConfigCommandCenter.schemaErrors.push(LOCALIZATION.INVALID_SCHEMA);
            }
        };
        reader.readAsText(file);
    }

    const onRemoveUploadedSchema = () => {
        props.commandEvent(CommandEvent.loadSchema);
    }

    return (


        <div className={classes.container}>
            <div>
                <div className={classes.top}>
                    <img alt="cognite-logo" src={logo} className={classes.logo} />
                    <Text strong className={classes.title}>{LOCALIZATION.SIDENAV_TITLE}</Text>
                </div>
                <Divider />
                <div className={classes.schemaUpload}>
                    <FileUploader onUpload={onUpload} onRemove={onRemoveUploadedSchema}>{LOCALIZATION.SIDENAV_UPLOAD}</FileUploader>
                </div>
                <Divider />
                <div className={classes.createNewBtn}>
                    <CommandItem className={classes.btn} icon={"plus"} onClick={() => onJsonConfigSelectHandler(null)}>{LOCALIZATION.SIDENAV_CREATENEW}</CommandItem>
                </div>
                <Text strong>{LOCALIZATION.SIDENAV_SUBTITLE}</Text>
            </div>
            <div>
                <div className={classes.jsonConfigContainer}>
                    <ConfigSelector
                        onJsonConfigSelectHandler={onJsonConfigSelectHandler}
                        jsonConfigMap={props.jsonConfigMap}
                        selectedJsonConfigId={props.selectedJsonConfigId}
                    />
                </div>
            </div>
        </div>
    );
}
