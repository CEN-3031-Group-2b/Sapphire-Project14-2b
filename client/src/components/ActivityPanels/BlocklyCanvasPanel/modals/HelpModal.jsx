import { Modal, Button, Typography, Menu,message } from 'antd';
import React, { useState } from 'react';
import { getArduino, getXml, getJS } from '../../Utils/helpers';

export default function HelpModal(props) {
  const [visible, setVisible] = useState(false);
  const { title, workspaceRef } = props;
  const { Text } = Typography;

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = () => {
    setVisible(false);
  };
  
  return (
    <div id='help-modal'>
      <Menu.Item id='show-help-icon' onClick={showModal}>
          <i className='fa fa-question' />
          &nbsp; Help Page
      </Menu.Item>
      
      <Modal
        title="Help Page"
        visible={visible}
        onOk={handleOk}
        width='50vw'
        footer={[
          <Button key='ok' type='primary' onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <Typography.Title level={4}>Documentation Links</Typography.Title>
        <ul>
          <li>
            <a href="https://www.python.org/doc/" target="_blank" rel="noopener noreferrer">Python Documentation</a>
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">JavaScript Documentation</a>
          </li>
          <li>
            <a href="https://www.arduino.cc/reference/en/" target="_blank" rel="noopener noreferrer">Arduino Documentation</a>
          </li>
        </ul>
      </Modal>
    </div>
  );
}