import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { Switch } from "antd";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { extractErrorMessage } from '../JsonConfigurator/JsonConfigurator';
import { saveConfig, updateConfig, deleteConfig } from '../../util/uiMessages/commandPanel'

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
    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            props.commandEvent(CommandEvent.mode, Modes.default, evt);
        } else {
            props.commandEvent(CommandEvent.mode, Modes.paste, evt);
        }
    }

    const onSaveHandler = () => {
        if (!isValidFileName()) {
            message.error(`${saveConfig.invalidFile}`);
        }
        else {
            confirm({
                title: `${saveConfig.title}`,
                icon: <ExclamationCircleOutlined />,
                content: `${saveConfig.content}`,
                onOk() {
                    props.commandEvent(CommandEvent.saveAs)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success(`${saveConfig.success}`);
                        })
                        .catch((error: any) => {
                            message.error(`${saveConfig.error} ${extractErrorMessage(error)}`);
                        });
                }
            });
        }
    }

    const onUpdateHandler = () => {
        if (!isValidFileName()) {
            message.error(`${updateConfig?.invalidFile}`);
        }
        else {
            confirm({
                title: `${updateConfig.title}`,
                icon: <ExclamationCircleOutlined />,
                content: `${updateConfig.content}`,
                onOk() {
                    props.commandEvent(CommandEvent.update)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success(`${updateConfig.success}`);
                        })
                        .catch((error: any) => {
                            message.error(`${updateConfig.error} ${extractErrorMessage(error)}`);
                        });
                }
            });
        }
    }

    const onDeleteHandler = () => {
        if (!isValidFileName()) {
            message.error(`${deleteConfig.invalidFile}`);
        }
        else {
            confirm({
                title: `${deleteConfig.title}`,
                icon: <ExclamationCircleOutlined />,
                content: `${deleteConfig.content}`,
                onOk() {
                    props.commandEvent(CommandEvent.delete)
                        .then(() => {
                            props.reloadJsonConfigs(null);
                            message.success(`${deleteConfig.success}`);
                        })
                        .catch((error: any) => {
                            message.error(`${deleteConfig.error} ${extractErrorMessage(error)}`);
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
                <span>Select Mode:</span>
                <Switch checkedChildren="tree" unCheckedChildren="code" defaultChecked onChange={onModeSwitch} />
            </div>
            <div className={classes.rightPanel}>
                <CommandItem className={classes.btn} icon={"download"} onClick={onDownloadHandler}>DOWNLOAD</CommandItem>
                <CommandItem className={classes.btn} icon={"save"} onClick={onSaveHandler}>SAVE</CommandItem>
                {props.selectedJsonConfigId &&
                    <>
                        <CommandItem className={classes.btn} icon={"upload"} onClick={onUpdateHandler}>UPDATE</CommandItem>
                        <CommandItem className={classes.btn} icon={"delete"} onClick={onDeleteHandler}>DELETE</CommandItem>
                    </>
                }
            </div>


        </div>
    );
}
