import { Modal, Button, Typography, Menu,message } from 'antd';
import React, { useState } from 'react';
import { getArduino, getXml, getJS } from '../../Utils/helpers';
import languageGif from '/src/assets/LanguageChangeDemo.gif';
import LoopTooLong from '/src/assets/LoopTooLong.png';
import runCode from '/src/assets/runCode.png';

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
        onCancel={handleCancel}
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
        <img src={languageGif} alt="Video of cursor hovering over 'Language' dropdown and switching selected language"></img>
        <p><b>Running your Code</b></p>
        <p>Running code is currently supported through <a href="https://neil.fraser.name/software/JS-Interpreter/docs.html">JS-Interpreter</a> and is only available when the chosen language is JavaScript or Python.
        When JavaScript or Python is the current language, a <b>Run</b> button appears. Click this button, then click Run and a window showing the output of your code will display.</p>
        <img src={runCode} alt="Image showing the 'Run Code' button."></img>
        <p>When using <a href="https://en.wikipedia.org/wiki/For_loop">for-loops </a>in a program, a problem can arrise where the loop continues enlessly.
        This results in the program freezing and potentially crashing. To prevent this, we currently have an upper limit to the amount of loops a program can make. If your program is too long, 
        you will see the message <b>"Loop too long!"</b> and the output performed before the limit was reached will be displayed.</p>
        <img src={LoopTooLong} alt="Image of 'Loop too long!' message."></img>
      </Modal>
    </div>
  );
}