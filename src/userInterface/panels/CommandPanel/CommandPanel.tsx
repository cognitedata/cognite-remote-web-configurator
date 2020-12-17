import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { Switch } from "antd";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";
import { JsonConfigCommandCenter } from '../../../core/JsonConfigCommandCenter';
import { UNTITLED } from "../../../constants";

export const CommandPanel: React.FC<{
    jsonConfig: any,
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

    const onCreateNew = () => {
        props.commandEvent(CommandEvent.createNew);
    }

    const onSaveHandler = () => {
        if (confirm("Do you want to create new Json Config?")) {
            props.commandEvent(CommandEvent.saveAs)
                .then((response: any) => {
                    const createdId = response.data.data.items[0].id;
                    props.reloadJsonConfigs(createdId);
                    alert("Data saved successfully!");
                })
                .catch((error: any) => {
                    JsonConfigCommandCenter.errorAlert("Save Cancelled!", error);
                });
        }
    }

    const onUpdateHandler = () => {
        if (confirm("Do you want to update file with new changes?")) {
            props.commandEvent(CommandEvent.update)
                .then((response: any) => {
                    const createdId = response.data.data.items[0].id;
                    props.reloadJsonConfigs(createdId);
                    alert("Data updated successfully!");
                })
                .catch((error: any) => {
                    JsonConfigCommandCenter.errorAlert("Update failed!", error);
                });
        }
    }

    const onDeleteHandler = () => {
        if (confirm("Are you sure you want to permanently delete this config?")) {
            props.commandEvent(CommandEvent.delete)
                .then(() => {
                    props.reloadJsonConfigs(null);
                    alert("Json Config Deleted successfully!");
                })
                .catch((error: any) => {
                    JsonConfigCommandCenter.errorAlert("Delete Cancelled!", error);
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
                <span className={classes.titleText}>{props.jsonConfig?.data?.header?.name || UNTITLED}</span>
            </div>
            <div className={classes.rightPanel}>
                <CommandItem className={classes.btn} icon={"plus"} onClick={onCreateNew}>Create</CommandItem>
                <CommandItem className={classes.btn} icon={"download"} onClick={onDownloadHandler}>Download</CommandItem>
                <CommandItem className={classes.btn} icon={"save"} onClick={onSaveHandler}>Save</CommandItem>
                {props.selectedJsonConfigId &&
                    <>
                        <CommandItem className={classes.btn} icon={"upload"} onClick={onUpdateHandler}>Update</CommandItem>
                        <CommandItem className={classes.btn} icon={"delete"} onClick={onDeleteHandler}>Delete</CommandItem>
                    </>
                }
            </div>


        </div>
    );
}
