import { Modal, Button, Menu,message } from 'antd';
import React, { useState } from 'react';
import Interpreter from 'js-interpreter';
import { getJS } from '../../Utils/helpers';

// This file contains the implementation of the Run button as well as the implementation of JS Interpreter

export default function RunModal(props) {
  const [visible, setVisible] = useState(false);
  const { title, workspaceRef } = props;
  const [output, setOutput] = useState([]);
  let tempOutput = [];
  const [loopTooLong, setLoopTooLong] = useState(false);

  // ShowModal is run on click of the run button. 
  // The code is gotten from getJS, which is how Blockly converts the blocks to JS code using a generator.
  // A JS-Interpreter interpreter is made, and the code and Api is passed into it. The API is explained further down.
  // To implement safe looping, a maximum of 1000 lines of code is stepped through. This can be changed to allow for longer/shorter
  // programs. 
  // The output of the interpreter is saved, and displayed in the return section of this code. 

  const showModal = () => {
    setLoopTooLong(false);
    setVisible(true);
    const code = getJS(workspaceRef, false);
    var interp = new Interpreter(code, initApi);
    for (let i = 0; i < 1000; i++) {
      if (!interp.step()) break;
    }
    if (interp.step()) setLoopTooLong(true);
    setOutput(tempOutput);
    tempOutput = [];
  };

  const handleCancel = () => {
    setVisible(false);
    setOutput([]);
  };

  const handleOk = () => {
    setVisible(false);
    setOutput([]);
  };

  // This API allows the interpreter to intercept "alert()" code and instead print the contents to the screen.
  // The contents of the alert() command is saved into an array, which is displayed later in the return block.

  function initApi(interpreter, globalObject) 
  {
    // Add an API function for the alert() block, generated for "text_print" blocks.
    const wrapperAlert = function alert(text) 
    {
      text = arguments.length ? text : '';
      tempOutput = [...tempOutput, text];
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
          {!loopTooLong ? '' : <b>Loop too long!</b>}
          <div id="code-text-box">
            {output.length > 0 ? output.map(t => <div>{t}</div>) : <i>No output.</i>}
          </div>
        </Modal>
      </div>
    );
  }
    catch(err){
          message.error("Can not compile");
    }
}