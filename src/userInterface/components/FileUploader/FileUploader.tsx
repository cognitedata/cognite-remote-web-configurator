import React, { useState } from 'react';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Upload from 'antd/lib/upload';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { LOCALIZATION } from '../../../constants';

enum FileUploadStatus {
    Uploading = 'uploading',
    Done= 'done',
    Error = 'error',
    Removed = 'removed'
}
export const FileUploader: React.FC<{ onUpload: (file?: UploadFile | undefined) => void, onRemove: () => void  }> = (props) => {
    const [fileList, setFileList] = useState<UploadFile<any>[] | undefined>(undefined);

    const settings = {
        name: 'fileUploader',
        fileList: fileList,
        maxCount: 1,
        onChange(info: UploadChangeParam<UploadFile<any>>) {
            if (info.file.status === FileUploadStatus.Done) {
                message.success(LOCALIZATION.FILE_UPLOAD_OK);
                props.onUpload(info.fileList.slice(-1)[0]);
            }
            else if (info.file.status === FileUploadStatus.Error) {
                message.error(LOCALIZATION.FILE_UPLOAD_FAILED);
            }
            if (info.file.status === FileUploadStatus.Removed) {
                props.onRemove();
                message.success(LOCALIZATION.SWITCHED_TO_DEFAULT);
            }
            // Only show latest uploaded file, and old ones will be replaced by the new
            setFileList(info.fileList.slice(-1));
        }
    };

    return (
        <Upload {...settings}>
            <Button icon='upload'>{props.children}</Button>
        </Upload>
    )
}