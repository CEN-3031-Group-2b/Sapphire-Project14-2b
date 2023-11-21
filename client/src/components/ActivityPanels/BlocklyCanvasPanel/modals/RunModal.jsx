import { Modal, Button, Typography, Menu,message } from 'antd';
import React, { useState } from 'react';
import { getArduino, getXml, getJS } from '../../Utils/helpers';

export default function RunModal(props) {
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
  try {
    return (
      <div id='run-modal'>

        <Menu.Item id='show-run-icon' onClick={showModal}>
            <i className='fa fa-play' />
            &nbsp;Run Code
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
          
          {workspaceRef ? (
            <div id='code-text-box'>
              <Text copyable style={{ whiteSpace: 'pre-wrap' }}>
                {title === 'XML'
                  ? getXml(workspaceRef, false)
                  :( title === 'Javascript' ?eval(getJS(workspaceRef, false)):getArduino(workspaceRef,false))}
              </Text>
            </div>
          ) : null}
        </Modal>
      </div>
    );
  }
    catch(err){
          message.error("Can not compile");
    }
}