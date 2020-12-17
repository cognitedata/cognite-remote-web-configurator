import React, { useState } from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import Switch from 'antd/es/switch';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { extractErrorMessage } from '../JsonConfigurator/JsonConfigurator';
import { LOCALIZATION } from '../../../constants';

const { confirm } = Modal;

const isValidFileName = (): boolean => {
    const fileName = JsonConfigCommandCenter.currentFileName;
    if (fileName) {
        return true;
    }
    return false;
}

export const CommandPanel: React.FC<{
    commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void,
    reloadJsonConfigs: (jsonConfigId: number | null) => void,
    selectedJsonConfigId: number | null
}> = (props: any) => {
    const [title, setTitle] = useState(LOCALIZATION.UNTITLED);

    const titleUpdateCallBack = (text: string) => {
        setTitle(text);
    };
    JsonConfigCommandCenter.titleUpdateCallback = titleUpdateCallBack;

    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            props.commandEvent(CommandEvent.mode, Modes.default, evt);
        } else {
            props.commandEvent(CommandEvent.mode, Modes.paste, evt);
        }
    }

    const onSaveHandler = () => {
        if (!isValidFileName()) {
            message.error(LOCALIZATION.SAVE_INVALID_FILE);
        }
        else {
            confirm({
                title: LOCALIZATION.SAVE_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.SAVE_CONTENT,
                onOk() {
                    props.commandEvent(CommandEvent.saveAs)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success(LOCALIZATION.SAVE_SUCCESS);
                        })
                        .catch((error: any) => {
                            message.error(LOCALIZATION.SAVE_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                        });
                }
            });
        }
    }

    const onUpdateHandler = () => {
        if (!isValidFileName()) {
            message.error(LOCALIZATION.UPLOAD_INVALID_FILE);
        }
        else {
            confirm({
                title: LOCALIZATION.UPLOAD_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.UPLOAD_CONTENT,
                onOk() {
                    props.commandEvent(CommandEvent.update)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success(LOCALIZATION.UPLOAD_SUCCESS);
                        })
                        .catch((error: any) => {
                            message.error(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                        });
                }
            });
        }
    }

    const onDeleteHandler = () => {
        if (!isValidFileName()) {
            message.error(LOCALIZATION.DELETE_INVALID_FILE);
        }
        else {
            confirm({
                title: LOCALIZATION.DELETE_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.DELETE_CONTENT,
                onOk() {
                    props.commandEvent(CommandEvent.delete)
                        .then(() => {
                            props.reloadJsonConfigs(null);
                            message.success(LOCALIZATION.DELETE_SUCCESS);
                        })
                        .catch((error: any) => {
                            message.error(LOCALIZATION.DELETE_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                        });
                }
            });
        }
    }

    const onDownloadHandler = () => {
        props.commandEvent(CommandEvent.download);
    }

    return (
        <div className={classes.commandsContainer}>
            <div className={classes.leftPanel}>
                <span>Switch Mode:</span>
                <Switch checkedChildren="tree" unCheckedChildren="code" defaultChecked onChange={onModeSwitch} />
            </div>
            <div className={classes.titlePanel}>
                <span className={classes.titleText}>{title}</span>
            </div>
            <div className={classes.rightPanel}>
                <CommandItem className={classes.btn} icon={"save"} onClick={onSaveHandler}>Save As New</CommandItem>
                {props.selectedJsonConfigId && <CommandItem className={classes.btn} icon={"upload"} onClick={onUpdateHandler}>Update</CommandItem>}
                <CommandItem className={classes.btn} icon={"download"} onClick={onDownloadHandler}>Download</CommandItem>
                {props.selectedJsonConfigId && <CommandItem className={classes.btn} icon={"delete"} onClick={onDeleteHandler}>Delete</CommandItem>}
            </div>


        </div>
    );
}
