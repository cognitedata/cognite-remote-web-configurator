import React, { useEffect, useRef } from "react";
import Button from "antd/es/button";
import classes from "../../panels/JsonConfigurator/JsonConfigurator.module.scss";
import { Modal } from "antd";
import AceDiff, { AceDiffConstructorOpts } from "ace-diff";
import styles from "./DiffMerge.module.scss";
import { LOCALIZATION, MergeText } from "../../../constants";
import { MergeModes } from "../../util/enums/MergeModes";

const getJson = (mergedJsonString: string) => {
    let mergedJson;
    try {
        mergedJson = JSON.parse(mergedJsonString);
    } catch (e: any) {
        console.error("Error Occurred while parsing json!");
    }
    return mergedJson
}

export function DiffMerge(props: { setShowMerge: (state: boolean) => void, showPopup: boolean, originalConfig: any, editedConfig: any, diffMode: MergeModes, onMerge: (mergedJsonString: string) => void, onCancel: () => void }) {

    const originalConfig = JSON.stringify(props.originalConfig, null, 2);
    const editedConfig = JSON.stringify(props.editedConfig, null, 2);
    const differInstance = useRef<AceDiff | null>(null);
    const originalDeleted = (props.diffMode === MergeModes.reloadServerDeleted || props.diffMode === MergeModes.saveServerDeleted);
    const mergeText = MergeText[props.diffMode];

    useEffect(() => {
        if (props.showPopup) {
            setTimeout(() => {
                const differ = new AceDiff(getAceDiffOptions(editedConfig, originalConfig));
                differInstance.current = differ;
            }, 350);
        }
    }, [props.showPopup])

    const handleCancelMerge = () => {
        props.onCancel();
        props.setShowMerge(false);
    }

    const handleLeftMerge = () => {
        const differ = differInstance.current;
        if (differ) {
            const mergedJsonString = differ.getEditors().left.getValue();
            const mergedJson = getJson(mergedJsonString);
            props.onMerge(mergedJson);
        }
        props.setShowMerge(false);
    }

    const handleRightMerge = () => {
        const differ = differInstance.current;
        if (differ) {
            const mergedJsonString = differ.getEditors().right.getValue();
            const mergedJson = getJson(mergedJsonString);
            props.onMerge(mergedJson);
        }
        props.setShowMerge(false);
    }


    return (
        <Modal
            title="Merge Versions"
            visible={props.showPopup}
            onCancel={handleCancelMerge}
            width={1050}
            footer={
                [
                    <Button key="left" onClick={handleLeftMerge} hidden={originalDeleted}>{mergeText.btnLeft}</Button>,
                    <Button key="your" onClick={handleRightMerge}>{mergeText.btnRight}</Button>
                ]
            }
        >
            <div className={styles.editorLblContainer}>
                <span className="editor-lbl">{mergeText.txtLeft}</span>
                <span className="editor-lbl">{mergeText.txtRight}</span>
            </div>
            <div className={`${classes.mergePrompt} acediff ${originalDeleted && 'original-deleted'}`}></div>
        </Modal>);
}

export function getAceDiffOptions(currentJson: string, serverJson?: string) : AceDiffConstructorOpts {
    let options: AceDiffConstructorOpts;

    if(!serverJson) {
        options =  {
            element: '.acediff',
            showDiffs: false,
            showConnectors: false,
            left: {
                content: LOCALIZATION.FILE_DELETED_IN_SERVER,
                copyLinkEnabled: false,
                editable: false
            },
            right: {
                content: currentJson,
                copyLinkEnabled: false,
            }
        }
    } else {
        options =  {
            element: '.acediff',
            left: {
                content: serverJson
            },
            right: {
                content: currentJson
            },
        }
    }
    return options;
}