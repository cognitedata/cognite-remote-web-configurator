import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { Switch } from "antd";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const extractErrorMessage = (error: string): string => {
    const errorMsg = `${error}`.split(" | ")[0].split(": ")[1];
    return errorMsg;
}

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
            message.error("Save Cancelled!\nPlease add a file name");
        }
        else {
            confirm({
                title: 'Cretate New Json Config',
                icon: <ExclamationCircleOutlined/>,
                content: 'Do you want to cretate new Json Config?',
                onOk() {
                    props.commandEvent(CommandEvent.saveAs)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success("Data saved successfully!");
                        })
                        .catch((error: any) => {
                            message.error(`Save Cancelled! ${extractErrorMessage(error)}`);
                        });
                }
            });
        }
    }

    const onUpdateHandler = () => {
        if (!isValidFileName()) {
            message.error("Update Cancelled!\nPlease select a file");
        }
        else {
            confirm({
                title: 'Update File',
                icon: <ExclamationCircleOutlined/>,
                content: 'Do you want to update file with new changes?',
                onOk() {
                    props.commandEvent(CommandEvent.update)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success("Data updated successfully!");
                        })
                        .catch((error: any) => {
                            message.error(`Update failed! ${extractErrorMessage(error)}`);
                        });
                }
            });
        }
    }

    const onDeleteHandler = () => {
        if (!isValidFileName()) {
            message.error("Delete Cancelled!\nPlease select a file");
        }
        else {
            confirm({
                title: 'Delete Config',
                icon: <ExclamationCircleOutlined/>,
                content: 'Are you sure you want to permanently delete this config?',
                onOk() {
                    props.commandEvent(CommandEvent.delete)
                        .then(() => {
                            props.reloadJsonConfigs(null);
                            message.success("Json Config Deleted successfully!");
                        })
                        .catch((error: any) => {
                            message.error(`Delete Cancelled! ${extractErrorMessage(error)}`);
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
