// @ts-nocheck
import {Button, Card, Image, Input, List, message, Row, Space, Typography, Upload, UploadFile, UploadProps} from "antd";
import React, {useState} from "react";

import {Upload as UploadApi} from '../wailsjs/go/main/App'

const {Title} = Typography

function App() {

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [resultList, setResultList] = useState<Array<string>>([]);
    const [hideResult, setHideResult] = useState(true);
    const [targetPath, setTargetPath] = useState("")

    const bucket = "codeffect"

    const handleUpload = () => {
        setUploading(true)
        UploadApi(targetPath, fileList).then((response) => {
            setResultList(response)
        }).catch(err => {
            message.error(err);
        }).finally(() => {
            setUploading(false)
            setHideResult(false)
        })
    }

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            if (file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/jpg') {
                message.error(`需要图片嗷`);
                return false
            }
            setFileList([...fileList, file]);
            return false;
        },
        listType: "picture",
        fileList,
    };

    return (
        <div>
            <Row justify='center'>
                <Card bordered={false} style={{height: '80%', width: '60%'}} justify='center'>
                    <Row align='middle' style={{marginBottom: 30}}>
                        <Image src='https://dn-mars-assets.qbox.me/qiniulogo/normal-logo-blue.png'
                               style={{maxWidth: '100px', maxHeight: '100px'}}/>
                        <Title>七牛上传</Title>
                    </Row>
                    <Row style={{marginBottom: 20, display: 'flex'}}>
                        <Space direction='vertical' size='middle' style={{width: '100%'}}>
                            <Space.Compact style={{width: '100%'}}>
                                <Input addonBefore={bucket}
                                       placeholder='请输入上传路径，比如：/suki/promote/' value={targetPath}
                                       onChange={e => {
                                           setTargetPath(e.target.value)
                                       }}/>
                            </Space.Compact>
                            <Space.Compact>
                                <b>地址预览：</b> $PATH_PREFIX/{targetPath}{targetPath === '' ? '' : '/foo.png'}
                            </Space.Compact>
                        </Space>
                    </Row>
                    <Row>
                        <Upload {...props}>
                            <Button>选择文件</Button>
                        </Upload>
                    </Row>
                    <Row>
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{marginTop: 16}}
                        >
                            {uploading ? '上传中' : '开始上传'}
                        </Button>
                    </Row>
                    <div hidden={hideResult}>
                        <Typography>
                            <h5>图片 URL</h5>
                        </Typography>
                        <Row justify='center'>
                            <List
                                itemLayout="vertical"
                                size="large"
                                pagination={{
                                    pageSize: 5,
                                }}
                                bordered
                                dataSource={resultList}
                                renderItem={(item) => (
                                    <List.Item>
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </Row>
                    </div>
                </Card>
            </Row>
        </div>
    )
        ;
}

export default App;
