import React, { useEffect, useRef } from "react";
import Button from "antd/es/button";
import classes from "../../panels/JsonConfigurator/JsonConfigurator.module.scss";
import { Modal } from "antd";
import AceDiff from "ace-diff";
import styles from "./DiffMerge.module.scss";

const getJson = (mergedJsonString: string) => {
    let mergedJson;
    try {
        mergedJson = JSON.parse(mergedJsonString);
    } catch (e: any) {
        console.error("Error Occurred while parsing json!");
    }
    return mergedJson
}

export function DiffMerge(props: { setShowMerge: (state: boolean) => void, showPopup: boolean, serverJson: any, localJson: any, saveAfterMerge: boolean, onMerge: (mergedJsonString: string) => void, onCancel: () => void }) {

    const serverJson = JSON.stringify(props.serverJson, null, 2);
    const localJson = JSON.stringify(props.localJson, null, 2);
    const differInstance = useRef<AceDiff | null>(null);

    useEffect(() => {
        if (props.showPopup) {
            setTimeout(() => {
                const differ = new AceDiff({
                    element: '.acediff',
                    left: {
                        content: serverJson
                    },
                    right: {
                        content: localJson
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
                    <Button key="left" onClick={handleLeftMerge}>Accept Server Version {props.saveAfterMerge ? 'and Save' : ''}</Button>,
                    <Button key="your" onClick={handleRightMerge}>Accept Local Version {props.saveAfterMerge ? 'and Save' : ''}</Button>
                ]
            }
        >
            <div className={styles.editorLblContainer}>
                <span className="editor-lbl"> Server Version</span>
                <span className="editor-lbl"> Local Version</span>
            </div>
            <div className={`${classes.mergePrompt} acediff`}></div>
        </Modal>
    );
}