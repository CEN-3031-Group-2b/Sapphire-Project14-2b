import { Modal, Button, Typography, Menu,message } from 'antd';
import React, { useState } from 'react';
import { getArduino, getXml, getJS } from '../../Utils/helpers';
import languageGif from '/src/assets/LanguageChangeDemo.gif';

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
            We currently support outputting to the three languages below. Click on a link to learn more about these languages.
          </li>
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
        <p>To switch the language being worked in, hover over the dropdown labeled <b>Language</b> and select your language. A message will appear confirming the language output has switched.</p>
        <img src={languageGif} alt="Cursor hovering over 'Language' dropdown and switching selected language"></img>
      </Modal>
    </div>
  );
}