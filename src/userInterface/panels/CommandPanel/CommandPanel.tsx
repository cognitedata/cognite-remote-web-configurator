import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import Switch from 'antd/es/switch';
import message from 'antd/es/message';
import Modal from 'antd/es/modal';
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { ExclamationCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { extractErrorMessage } from '../JsonConfigurator/JsonConfigurator';
import { LOCALIZATION } from '../../../constants';
import { JsonConfig, MergeOptions } from '../../util/types';
import { MergeModes } from '../../util/enums/MergeModes';

const { confirm } = Modal;

export const CommandPanel: React.FC<{
    title: string,
    mode: string,
    isEdited: boolean,
    commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void,
    reloadJsonConfigs: (jsonConfigId: number | null) => void,
    setMergeOptions: (options: MergeOptions) => void
    selectedJsonConfigId: number | null,
    originalJsonConfig: JsonConfig | null,
}> = (props: any) => {

    const isUpdated = async (): Promise<boolean> => {
        if (props.selectedJsonConfigId) {
            const updatedJsonConfig = await JsonConfigCommandCenter.loadJsonConfigs()
                .then(response => {
                    if (response) {
                        const selectedJsonConfig: JsonConfig = response.get(props.selectedJsonConfigId);
                        if (selectedJsonConfig) {
                            return selectedJsonConfig;
                        }
                    }
                })
                .catch(error => {
                    message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                })
            return (JSON.stringify(props.originalJsonConfig) !== JSON.stringify(updatedJsonConfig));
        }
        return false;
    }


    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            props.commandEvent(CommandEvent.mode, Modes.paste, evt);
        } else {
            props.commandEvent(CommandEvent.mode, Modes.default, evt);
        }
    }

    const onReloadHandler = async () => {
        if (await isUpdated()) {
            if (props.isEdited) {
                props.setMergeOptions({
                    editedConfig: JsonConfigCommandCenter.currentJson,
                    originalConfig: await JsonConfigCommandCenter.loadJsonConfigs()
                        .then(response => {
                            if (response) {
                                return response.get(props.selectedJsonConfigId).data;
                            }
                        })
                        .catch(error => {
                            message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                        }),
                    diffMode: MergeModes.reload,
                    onOk: (mergedJson: any) => {
                        props.commandEvent(CommandEvent.reload, mergedJson);
                        message.success(LOCALIZATION.REFRESH_SUCCESS);
                    },
                    onCancel: () => {
                        message.warning(LOCALIZATION.REFRESH_ERROR.replace('{{error}}', ''));
                    }
                });
            }
            else {
                props.commandEvent(CommandEvent.reload);
            }
        }
        else {
            // reload with current text
            props.commandEvent(CommandEvent.reload, JsonConfigCommandCenter.currentJson);
        }
    }

    const save = () => {
        props.commandEvent(CommandEvent.saveAs);
    }

    const onSaveHandler = () => {
        if (!JsonConfigCommandCenter.currentFileName) {
            confirm({
                title: LOCALIZATION.SAVE_WITH_ERRORS_TITLE,
                icon: <WarningTwoTone twoToneColor="#faad14" />,
                content: LOCALIZATION.SAVE_WITHOUT_NAME_CONTENT,
                onOk() {
                    save();
                },
                onCancel() {
                    message.warning(LOCALIZATION.SAVE_ERROR.replace('{{error}}', ''));
                }
            });
        }
        else if (JsonConfigCommandCenter.hasErrors) {
            confirm({
                title: LOCALIZATION.SAVE_WITH_ERRORS_TITLE,
                icon: <WarningTwoTone twoToneColor="#faad14" />,
                content: LOCALIZATION.SAVE_WITH_ERRORS_CONTENT,
                onOk() {
                    save();
                },
                onCancel() {
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
                onCancel() {
                    message.warning(LOCALIZATION.SAVE_ERROR.replace('{{error}}', ''));
                }
            });
        }
    }

    const update = async () => {
        if (await isUpdated()) {
            props.setMergeOptions({
                editedConfig: JsonConfigCommandCenter.currentJson,
                originalConfig: await JsonConfigCommandCenter.loadJsonConfigs()
                    .then(response => {
                        if (response) {
                            return response.get(props.selectedJsonConfigId).data;
                        }
                    })
                    .catch(error => {
                        message.error(LOCALIZATION.RETRIEVE_CONFIGS_FAIL.replace('{{error}}', `${extractErrorMessage(error)}`));
                    }),
                diffMode: MergeModes.save,
                onOk: (mergedJson: any) => {
                    props.commandEvent(CommandEvent.update, mergedJson)
                        .then((response: any) => {
                            const createdId = response.data.data.items[0].id;
                            props.reloadJsonConfigs(createdId);
                            message.success(LOCALIZATION.UPDATE_SUCCESS);
                        })
                        .catch((error: any) => {
                            message.error(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                        });
                },
                onCancel: () => {
                    message.warning(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', ''));
                }
            });
        }
        else {
            props.commandEvent(CommandEvent.update)
                .then((response: any) => {
                    const createdId = response.data.data.items[0].id;
                    props.reloadJsonConfigs(createdId);
                    message.success(LOCALIZATION.UPDATE_SUCCESS);
                })
                .catch((error: any) => {
                    message.error(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', `${extractErrorMessage(error)}`));
                });
        }
    }

    const onUpdateHandler = () => {
        if (!JsonConfigCommandCenter.currentFileName) {
            confirm({
                title: LOCALIZATION.UPDATE_WITH_ERRORS_TITLE,
                icon: <WarningTwoTone twoToneColor="#faad14" />,
                content: LOCALIZATION.UPDATE_WITHOUT_NAME_CONTENT,
                onOk() {
                    update();
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', ''));
                }
            });
        }
        if (JsonConfigCommandCenter.hasErrors) {
            confirm({
                title: LOCALIZATION.UPDATE_WITH_ERRORS_TITLE,
                icon: <WarningTwoTone twoToneColor="#faad14" />,
                content: LOCALIZATION.UPDATE_WITH_ERRORS_CONTENT,
                async onOk() {
                    await update();
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', ''));
                }
            });
        }
        else {
            confirm({
                title: LOCALIZATION.UPDATE_TITLE,
                icon: <ExclamationCircleTwoTone />,
                content: LOCALIZATION.UPDATE_CONTENT,
                async onOk() {
                    await update();
                },
                onCancel() {
                    message.warning(LOCALIZATION.UPDATE_ERROR.replace('{{error}}', ''));
                }
            });
        }
    }

    const onDeleteHandler = () => {
        confirm({
            title: LOCALIZATION.DELETE_TITLE,
            icon: <WarningTwoTone twoToneColor="#ff4d4f" />,
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
            },
            onCancel() {
                message.warn(LOCALIZATION.DELETE_ERROR.replace('{{error}}', ''));
            },
            okType: 'danger',
        });
    }

    const onDownloadHandler = () => {
        props.commandEvent(CommandEvent.download);
    }

    const onDiffHandler = () => {
        props.setMergeOptions({
            // updated version
            editedConfig: JsonConfigCommandCenter.currentJson,
            // Latest update
            originalConfig: props.originalJsonConfig,
            diffMode: MergeModes.diff,
            onOk: (mergedJson: any) => {
                props.commandEvent(CommandEvent.diff, mergedJson);
                message.success(LOCALIZATION.DIFF_SUCCESS);
            },
            onCancel: () => {
                message.warning(LOCALIZATION.DIFF_CANCEL);
            }
        })
    }

    return (
        <div className={classes.commandsContainer}>
            <div className={classes.errorPanel}>
                {JsonConfigCommandCenter.schemaErrors.map(error => (
                    <div className={classes.errorItem}>
                        <WarningTwoTone twoToneColor="#faad14" />
                        <span> {error}</span>
                    </div>
                ))}
            </div>
            <div className={classes.leftPanel}>
                <span>Switch Mode:</span>
                <Switch checkedChildren="code" unCheckedChildren="tree" checked={props.mode === 'code'} onChange={onModeSwitch} />
            </div>
            <div className={classes.titlePanel}>
                <span className={classes.titleText}>{props.title}</span>
            </div>
            <div className={classes.rightPanel}>
                {props.isEdited ? <CommandItem className={classes.btn} icon={"diff"} onClick={onDiffHandler}>Diff</CommandItem> : null}
                <CommandItem className={classes.btn} icon={"reload"} onClick={onReloadHandler}>Reload</CommandItem>
                {(props.selectedJsonConfigId && props.isEdited) && <CommandItem className={classes.btn} icon={"save"} onClick={onUpdateHandler}>Save</CommandItem>}
                <CommandItem className={classes.btn} icon={"upload"} onClick={onSaveHandler}>Save As New</CommandItem>
                <CommandItem className={classes.btn} icon={"download"} onClick={onDownloadHandler}>Download</CommandItem>
                {props.selectedJsonConfigId && <CommandItem className={classes.btn} icon={"delete"} onClick={onDeleteHandler}>Delete</CommandItem>}
            </div>
        </div>
    );
}
