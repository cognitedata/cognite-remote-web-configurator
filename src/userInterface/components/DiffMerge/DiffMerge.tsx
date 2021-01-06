import React, { useEffect, useRef } from "react";
import Button from "antd/es/button";
import classes from "../../panels/JsonConfigurator/JsonConfigurator.module.scss";
import { Modal } from "antd";
import AceDiff from "ace-diff";
import styles from "./DiffMerge.module.scss";

export function DiffMerge(props: { showPopup: boolean, serverJson: any, localJson: any, onMerge: (mergedJsonString: string)=> void , onCancel: () => void }) {

    const serverJson = JSON.stringify(props.serverJson, null, 2);
    const localJson = JSON.stringify(props.localJson, null, 2);
    const differInstance = useRef<AceDiff | null>(null);

    useEffect(() => {
        if(props.showPopup) {
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
    }

    const handleLeftMerge = () => {
        const differ = differInstance.current;
        if(differ) {
            const mergedJsonString = differ.getEditors().left.getValue();
            props.onMerge(mergedJsonString);
        }
    }

    const handleRightMerge = () => {
        const differ = differInstance.current;
        if(differ) {
            const mergedJsonString = differ.getEditors().right.getValue();
            props.onMerge(mergedJsonString);
        }
    }


    return (
        <Modal
            title="Merge Versions"
            visible={props.showPopup}
            onCancel={handleCancelMerge}
            width={1050}
            footer={[
                <Button key="left" onClick={handleLeftMerge}>
                    Accept Server Version
                </Button>,
                <Button key="your" onClick={handleRightMerge}>
                    Accept Local Version
                </Button>
            ]}
        >
            <div className={styles.editorLblContainer}>
                <span className="editor-lbl"> Server Version</span>
                <span className="editor-lbl"> Local Version</span>
            </div>
            <div className={`${classes.mergePrompt} acediff`}></div>
        </Modal>
    );
}