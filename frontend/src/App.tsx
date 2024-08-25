// @ts-nocheck
import {Button, Card, Row, Typography, Upload, UploadFile, UploadProps} from "antd";
import React, {useState} from "react";

const {Title} = Typography;

function App() {

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = () => {
    }

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);

            return false;
        },
        fileList,
    };

    return (
        <div>
            <Row justify='center'>
                <Card title='Qiniu Upload' bordered={false} style={{height: '80%', width: '50%'}} justify='center'>
                    <Row justify='center'>
                        <Upload {...props}>
                            <Button>Select File</Button>
                        </Upload>
                    </Row>
                    <Row justify='center'>
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{marginTop: 16}}
                        >
                            {uploading ? 'Uploading' : 'Start Upload'}
                        </Button>
                    </Row>
                </Card>
            </Row>
        </div>
    );
}

export default App;
