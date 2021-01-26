import React, { useEffect, useRef } from "react";
import Button from "antd/es/button";
import classes from "../../panels/JsonConfigurator/JsonConfigurator.module.scss";
import { Modal } from "antd";
import AceDiff from "ace-diff";
import styles from "./DiffMerge.module.scss";
import { MergeModesMap } from "../../../constants";
import { IMergeText } from "../../util/Interfaces/MergeText";

const getJson = (mergedJsonString: string) => {
    let mergedJson;
    try {
        mergedJson = JSON.parse(mergedJsonString);
    } catch (e: any) {
        console.error("Error Occurred while parsing json!");
    }
    return mergedJson
}

export function DiffMerge(props: { setShowMerge: (state: boolean) => void, showPopup: boolean, originalConfig: any, editedConfig: any, diffMode: string, onMerge: (mergedJsonString: string) => void, onCancel: () => void }) {

    const originalConfig = JSON.stringify(props.originalConfig, null, 2);
    const editedConfig = JSON.stringify(props.editedConfig, null, 2);
    const differInstance = useRef<AceDiff | null>(null);
    const text: IMergeText | undefined = MergeModesMap.get(props.diffMode);

    useEffect(() => {
        if (props.showPopup) {
            setTimeout(() => {
                const differ = new AceDiff({
                    element: '.acediff',
                    left: {
                        content: originalConfig
                    },
                    right: {
                        content: editedConfig
                    },
                });
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
                    <Button key="left" onClick={handleLeftMerge}>{text?.btnLeft}</Button>,
                    <Button key="your" onClick={handleRightMerge}>{text?.btnRight}</Button>
                ]
            }
        >
            <div className={styles.editorLblContainer}>
                <span className="editor-lbl">{text?.txtLeft}</span>
                <span className="editor-lbl">{text?.txtRight}</span>
            </div>
            <div className={`${classes.mergePrompt} acediff`}></div>
        </Modal>
    );
}