// @ts-nocheck
import {
  Button,
  Card,
  Input,
  List,
  message,
  Image,
  Modal,
  Row,
  Space,
  Typography,
  UploadFile,
} from 'antd';

import { SettingOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

import {
  BatchSelectFiles as BatchSelectAPI,
  Upload as UploadAPI,
  SetConfig as SetConfigAPI,
} from '../wailsjs/go/main/App';

const { Title, Text } = Typography;

function App() {
  const [uploading, setUploading] = useState(false);
  const [hideResult, setHideResult] = useState(true);
  const [visible, setVisible] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [targetPath, setTargetPath] = useState('');
  const [bucket, setBucket] = useState('');
  const [domain, setDomain] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [resultList, setResultList] = useState<Array<string>>([]);

  const showModal = () => {
    setModalOpen(true);
  };

  const cancelModal = () => {
    setModalOpen(false);
  };

  const saveSettings = () => {
    SetConfigAPI(accessKey, secretKey, domain)
      .then(() => {
        message.success('保存成功');
        setModalOpen(false);
      })
      .catch(e => {
        message.error(e);
      });
  };

  const handleBatchFile = () => {
    BatchSelectAPI()
      .then(resp => {
        setFileList(resp);
      })
      .catch(err => {
        if (fileList.length === 0) {
          message.error(err);
        }
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleClear = () => {
    setFileList([]);
  };

  const handleUpload = () => {
    setUploading(true);
    UploadAPI(bucket, targetPath)
      .then(resp => {
        setResultList(resp);
        handleClear();
        message.success('上传成功');
      })
      .catch(err => {
        message.error(err);
      })
      .finally(() => {
        setUploading(false);
        setHideResult(false);
      });
  };

  return (
    <div>
      <Row justify="center">
        <Card bordered={false} style={{ height: '80%', width: '60%' }} justify="center">
          <Row align="middle" style={{ marginBottom: 30 }}>
            <Image
              src="https://dn-mars-assets.qbox.me/qiniulogo/normal-logo-blue.png"
              style={{ maxWidth: '100px', maxHeight: '100px', float: 'left' }}
            />
            <Title style={{ marginLeft: '10px' }}>七牛上传</Title>
            <Button
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              icon={<SettingOutlined />}
              onClick={showModal}
            >
              上传配置
            </Button>
            <Modal
              title="七牛配置"
              open={modalOpen}
              onOk={saveSettings}
              onCancel={cancelModal}
              footer={[
                <Button key="cancel" onClick={cancelModal}>
                  取消
                </Button>,
                <Button type="primary" key="ok" onClick={saveSettings}>
                  保存
                </Button>,
              ]}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    addonBefore="AK"
                    placeholder="请输入 AccessKey"
                    value={accessKey}
                    onChange={e => {
                      setAccessKey(e.target.value);
                    }}
                  />
                </Space.Compact>
                <Space.Compact style={{ width: '100%' }}>
                  <Input.Password
                    addonBefore="SK"
                    placeholder="请输入 SecretKey"
                    value={secretKey}
                    onChange={e => {
                      setSecretKey(e.target.value);
                    }}
                  />
                </Space.Compact>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    addonBefore="域名"
                    placeholder="请输入域名"
                    value={domain}
                    onChange={e => {
                      setDomain(e.target.value);
                    }}
                  />
                </Space.Compact>
              </Space>
            </Modal>
          </Row>
          <Row style={{ marginBottom: 20, display: 'flex' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  addonBefore="bucket"
                  placeholder="请输入 bucket 桶名"
                  value={bucket}
                  onChange={e => {
                    setBucket(e.target.value);
                  }}
                />
              </Space.Compact>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  addonBefore="上传路径"
                  placeholder="请输入上传路径，比如：test/hello，注意斜杠。"
                  value={targetPath}
                  onChange={e => {
                    setTargetPath(e.target.value);
                  }}
                />
              </Space.Compact>
              <Space.Compact>
                <b>地址预览：</b> {domain}/{targetPath === '' ? '' : targetPath + '/'}foo.jpg
              </Space.Compact>
            </Space>
          </Row>
          <Row style={{ marginBottom: 10 }}>
            <Button onClick={handleBatchFile}>选择文件</Button>
            <Button style={{ marginLeft: 20 }} onClick={handleClear}>
              清空列表
            </Button>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Text>
              图片格式: <Text strong>*.png;*.jpg;*.jpeg;*.gif</Text>
            </Text>
          </Row>
          <Row>
            <List
              style={{ width: '100%' }}
              header="文件列表"
              itemLayout="vertical"
              size="large"
              bordered
              dataSource={fileList}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
              style={{ marginTop: 16 }}
            >
              {uploading ? '上传中' : '开始上传'}
            </Button>
          </Row>
          <div hidden={hideResult}>
            <Typography>
              <h5>图片 URL</h5>
            </Typography>
            <Row justify="center">
              <List
                itemLayout="vertical"
                size="large"
                pagination={{
                  pageSize: 5,
                }}
                bordered
                dataSource={resultList}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Row>
          </div>
        </Card>
      </Row>
    </div>
  );
}

export default App;
