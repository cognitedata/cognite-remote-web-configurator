import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { Switch } from "antd";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";

export const CommandPanel: React.FC<{ commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void, selectedTwinName: string }> = (props: any) => {
    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            props.commandEvent(CommandEvent.mode, Modes.default, evt);
        } else {
            props.commandEvent(CommandEvent.mode, Modes.paste, evt);
        }
    }

    return (
        <div className={classes.commandsContainer}>
            <div className={classes.leftPanel}>
                <span>Select Mode:</span>
                <Switch checkedChildren="tree" unCheckedChildren="code" defaultChecked onChange={onModeSwitch} />
            </div>
            <div className={classes.rightPanel}>
                {props.selectedTwinName ?
                    <>
                        <CommandItem className={classes.btn} icon={"upload"} onClick={() => props.commandEvent(CommandEvent.update)}>UPDATE</CommandItem>
                        <CommandItem className={classes.btn} icon={"delete"} onClick={() => props.commandEvent(CommandEvent.delete)}>DELETE</CommandItem>
                    </> :
                    <>
                        <CommandItem className={classes.btn} icon={"save"} onClick={() => props.commandEvent(CommandEvent.saveAs)}>SAVE</CommandItem>
                    </>
                }
                <CommandItem className={classes.btn} icon={"download"} onClick={() => props.commandEvent(CommandEvent.download)}>DOWNLOAD</CommandItem>
            </div>


        </div>
    );
}
