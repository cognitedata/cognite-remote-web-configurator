import React, { useState } from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import Switch from 'antd/es/switch';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { ExclamationCircleOutlined, ExclamationCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { extractErrorMessage } from '../JsonConfigurator/JsonConfigurator';
import { LOCALIZATION } from '../../../constants';
import { JSONEditorMode } from "jsoneditor";
import { JsonConfig, MergeOptions } from '../../util/types';

const { confirm } = Modal;

const isUpdated = async (selectedJsonConfigId: number | null): Promise<boolean> => {
    if (selectedJsonConfigId) {
        const originalJsonConfig = JsonConfigCommandCenter.getOriginalJsonConfig();
        const updatedJsonConfig = await JsonConfigCommandCenter.loadJsonConfigs()
            .then(response => {
                if (response) {
                    const selectedJsonConfig = response.get(selectedJsonConfigId);
                    if (selectedJsonConfig) {
                        return (selectedJsonConfig as JsonConfig).data;
                    }
                }
            })
            .catch(error => {
                message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
            });
        return (JSON.stringify(originalJsonConfig) !== JSON.stringify(updatedJsonConfig));
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
                    saveAfterMerge: false,
                    onOk: (mergedJson: any) => {
                        props.commandEvent(CommandEvent.reload, mergedJson);
                        message.success(LOCALIZATION.REFRESH_SUCCESS);
                    },
                    onCancel: () => {
                        message.warning(LOCALIZATION.REFRESH_ERROR);
                    }
                });
            }
            else {
                props.commandEvent(CommandEvent.reload);
            }
        }
        else {
            props.commandEvent(CommandEvent.reload, JsonConfigCommandCenter.currentJson);
        }
    }

    const save = () => {
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

    const onSaveHandler = () => {
        if (JsonConfigCommandCenter.hasErrors) {
            confirm({
                title: LOCALIZATION.SAVE_WITH_ERRORS_TITLE,
                icon: <WarningTwoTone twoToneColor="#eb2f96"/>,
                content: LOCALIZATION.SAVE_WITH_ERRORS_CONTENT,
                onOk() {
                    save();
                },
                onCancel(){
                    message.warning(LOCALIZATION.SAVE_ERROR.replace('{{error}}', ''));
                }
            });
        }
        else {
            confirm({
                title: LOCALIZATION.SAVE_TITLE,
                icon: <ExclamationCircleTwoTone />,
                content: LOCALIZATION.SAVE_CONTENT,
                onOk() {
                    save();
                },
                onCancel(){
                    message.warning(LOCALIZATION.SAVE_ERROR.replace('{{error}}', ''));
                }
            });
        }
    }

    const update = async () => {
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
                saveAfterMerge: true,
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
    }

    const onUpdateHandler = () => {
        if (JsonConfigCommandCenter.hasErrors) {
            confirm({
                title: LOCALIZATION.UPLOAD_WITH_ERRORS_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.UPLOAD_WITH_ERRORS_CONTENT,
                async onOk() {
                    update();
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', ''));
                }
            });
        }
        else {
            confirm({
                title: LOCALIZATION.UPLOAD_TITLE,
                icon: <ExclamationCircleOutlined />,
                content: LOCALIZATION.UPLOAD_CONTENT,
                async onOk() {
                    update();
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPLOAD_ERROR.replace('{{error}}', ''));
                }
            });
        }
    }

    const onDeleteHandler = () => {
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
