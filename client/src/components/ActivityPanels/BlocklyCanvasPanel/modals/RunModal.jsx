import { Modal, Button, Menu,message } from 'antd';
import React, { useState } from 'react';
import Interpreter from 'js-interpreter';
import { getJS } from '../../Utils/helpers';

export default function RunModal(props) {
  const [visible, setVisible] = useState(false);
  const { title, workspaceRef } = props;
  const [output, setOutput] = useState([]);


  const showModal = () => {
    setVisible(true);
    const code = getJS(workspaceRef, false);
    console.log(code);
    const interp = new Interpreter(code, initApi);
    interp.run();
  };

  const handleCancel = () => {
    setVisible(false);
    setOutput([]);
  };

  const handleOk = () => {
    setVisible(false);
    setOutput([]);
  };

  function initApi(interpreter, globalObject) 
  {
    // Add an API function for the alert() block, generated for "text_print" blocks.
    const wrapperAlert = function alert(text) 
    {
      text = arguments.length ? text : '';
      setOutput([...output, text]);
    };

    interpreter.setProperty(globalObject, 'alert',
    interpreter.createNativeFunction(wrapperAlert));
  }

  try {
    return (
      <div id='run-modal'>

        <Menu.Item id='show-run-icon' onClick={showModal}>
            <i className='fa fa-play' />
            &nbsp; Run Code
        </Menu.Item>
        
        <Modal
          title={title}
          visible={visible}
          onCancel={handleCancel}
          width='50vw'
          footer={[
            <Button key='ok' type='primary' onClick={handleOk}>
              OK
            </Button>,
          ]}
        >
          
          <div id='code-text-box'>
            {output.length > 0 ? output.join('\n'): <i>No output.</i>}
          </div>
        </Modal>
      </div>
    );
  }
    catch(err){
          message.error("Can not compile");
    }
}