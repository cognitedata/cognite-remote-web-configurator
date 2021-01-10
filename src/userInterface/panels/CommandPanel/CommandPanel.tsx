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
import { JSONEditorMode } from "jsoneditor";
import { JsonConfig, MergeOptions } from '../../util/types';
import hash from 'object-hash';

const { confirm } = Modal;

const isValidFileName = (): boolean => {
    const fileName = JsonConfigCommandCenter.currentFileName;
    if (fileName) {
        return true;
    }
    return false;
}

const isUpdated = async (selectedJsonConfigId: number | null): Promise<boolean> => {
    if (selectedJsonConfigId) {
        const originalHash = JsonConfigCommandCenter.getOriginalHash();
        const updatedHash = await JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => {
                if (response) {
                    const selectedJsonConfig = response.get(selectedJsonConfigId);
                    if (selectedJsonConfig) {
                        return hash((selectedJsonConfig as JsonConfig).data);
                    }
                }
            })
            .catch(error => {
                message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
            });
        return (originalHash !== updatedHash);
    }
    return false;
}

export const CommandPanel: React.FC<{
    commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void,
    reloadJsonConfigs: (jsonConfigId: number | null) => void,
    setMergeOptions: (options: MergeOptions) => void
    selectedJsonConfigId: number | null
}> = (props: any) => {
    const [title, setTitle] = useState(LOCALIZATION.UNTITLED);
    const [mode, setMode] = useState('tree');

    const titleUpdateCallBack = (text: string, mode: JSONEditorMode) => {
        setTitle(text);
        setMode(mode);
    };
    JsonConfigCommandCenter.titleUpdateCallback = titleUpdateCallBack;

    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            setMode(Modes.paste);
            props.commandEvent(CommandEvent.mode, Modes.paste, evt);
        } else {
            setMode(Modes.default);
            props.commandEvent(CommandEvent.mode, Modes.default, evt);
        }
    }

    const onReloadHandler = async () => {
        if (await isUpdated(props.selectedJsonConfigId)) {
            if (JsonConfigCommandCenter.isEdited()) {
                props.setMergeOptions({
                    localConfig: JsonConfigCommandCenter.currentJson,
                    serverConfig: await JsonConfigCommandCenter.loadJsonConfigs()
                        .then(response => {
                            if (response) {
                                return response.get(props.selectedJsonConfigId).data;
                            }
                        })
                        .catch(error => {
                            message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                        }),
                        onOk: (mergedJson: any) => {
                            props.commandEvent(CommandEvent.reload, mergedJson);
                        },
                        onCancel: () => {
                            // ToDo: update with proper message
                            message.warning("reload cancelled");
                        }
                });
            }
            else {
                props.commandEvent(CommandEvent.reload);
            }
        }
        else {
            props.commandEvent(CommandEvent.reload);
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
                            JsonConfigCommandCenter.updateTitle();
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
                async onOk() {
                    if (await isUpdated(props.selectedJsonConfigId)) {
                        props.setMergeOptions({
                            localConfig: JsonConfigCommandCenter.currentJson,
                            serverConfig: await JsonConfigCommandCenter.loadJsonConfigs()
                                .then(response => {
                                    if (response) {
                                        return response.get(props.selectedJsonConfigId).data;
                                    }
                                })
                                .catch(error => {
                                    message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                                }),
                            onOk: (mergedJson: any) => {
                                props.commandEvent(CommandEvent.update, mergedJson)
                                    .then((response: any) => {
                                        const createdId = response.data.data.items[0].id;
                                        props.reloadJsonConfigs(createdId);
                                        JsonConfigCommandCenter.updateTitle();
                                        message.success(LOCALIZATION.UPLOAD_SUCCESS);
                                    })
                                    .catch((error: any) => {
                                        message.error(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                                    });
                            },
                            onCancel: () => {
                                message.warning(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', ''));
                            }
                        });
                    }
                    else {
                        props.commandEvent(CommandEvent.update)
                            .then((response: any) => {
                                const createdId = response.data.data.items[0].id;
                                props.reloadJsonConfigs(createdId);
                                JsonConfigCommandCenter.updateTitle();
                                message.success(LOCALIZATION.UPLOAD_SUCCESS);
                            })
                            .catch((error: any) => {
                                message.error(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                            });
                    }
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', ''));
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
                <Switch checkedChildren="code" unCheckedChildren="tree" checked={mode === 'code'} onChange={onModeSwitch} />
            </div>
            <div className={classes.titlePanel}>
                <span className={classes.titleText}>{title}</span>
            </div>
            <div className={classes.rightPanel}>
                <CommandItem className={classes.btn} icon={"reload"} onClick={onReloadHandler}>Reload</CommandItem>
                {props.selectedJsonConfigId && <CommandItem className={classes.btn} icon={"save"} onClick={onUpdateHandler}>Save</CommandItem>}
                <CommandItem className={classes.btn} icon={"upload"} onClick={onSaveHandler}>Save As New</CommandItem>
                <CommandItem className={classes.btn} icon={"download"} onClick={onDownloadHandler}>Download</CommandItem>
                {props.selectedJsonConfigId && <CommandItem className={classes.btn} icon={"delete"} onClick={onDeleteHandler}>Delete</CommandItem>}
            </div>
        </div>
    );
}
