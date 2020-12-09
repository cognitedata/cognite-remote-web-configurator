import React from 'react';
import classes from './CommandPanel.module.scss';
import { CommandItem } from '../../components/CommandItem/CommandItem';
import { Switch } from "antd";
import { CommandEvent } from "../../util/Interfaces/CommandEvent";
import { Modes } from "../../util/enums/Modes";

export const CommandPanel: React.FC<{ commandEvent: (commandEvent: CommandEvent, ...args: any[]) => void, selectedTwin: string }> = (props: any) => {
    const onModeSwitch = (checked: boolean, evt: any) => {
        if (checked) {
            props.commandEvent(CommandEvent.Mode, Modes.default, evt);
        } else {
            props.commandEvent(CommandEvent.Mode, Modes.paste, evt);
        }
    }
    return (
        <div className={classes.commandsContainer}>
            <div className={classes.modeSwitch}>
                <span>Select Mode:</span>
                <Switch checkedChildren="tree" unCheckedChildren="code" defaultChecked onChange={onModeSwitch} />
            </div>
            {props.selectedTwin &&
                <>
                    <CommandItem className={classes.update} icon={"upload"}>UPDATE</CommandItem>
                    <CommandItem className={classes.delete} icon={"delete"}>DELETE</CommandItem>
                </>
            }

        </div>
    );
}
