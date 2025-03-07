import React, {useEffect, useRef, useState, useReducer} from 'react';
import {Link} from 'react-router-dom';
import '../../ActivityLevels.less';
import {compileArduinoCode, generateToolbox, getIncompatibleBlocks} from '../../Utils/helpers';
import {message, Spin, Row, Col, Alert, Menu, Dropdown, Space, Typography} from 'antd';
import CodeModal from '../modals/CodeModal';
import ConsoleModal from '../modals/ConsoleModal';
import PlotterModal from '../modals/PlotterModal';
import RunModal from '../modals/RunModal';
import HelpModal from '../modals/HelpModal';
import {DownOutlined} from '@ant-design/icons';
import {
    connectToPort,
    handleCloseConnection,
    handleOpenConnection,
} from '../../Utils/consoleHelpers';
import ArduinoLogo from '../Icons/ArduinoLogo';
import PlotterLogo from '../Icons/PlotterLogo';

let plotId = 1;

export default function PublicCanvas({activity, isSandbox}) {
    const [hoverUndo, setHoverUndo] = useState(false);
    const [hoverRedo, setHoverRedo] = useState(false);
    const [hoverCompile, setHoverCompile] = useState(false);
    const [hoverConsole, setHoverConsole] = useState(false);
    const [showConsole, setShowConsole] = useState(false);
    const [showPlotter, setShowPlotter] = useState(false);
    const [plotData, setPlotData] = useState([]);
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [selectedCompile, setSelectedCompile] = useState(false);
    const [compileError, setCompileError] = useState('');
    const [languageChoicePublic, setLanguageChoice] = useState("Arduino");

    const [forceUpdate] = useReducer((x) => x + 1, 0);
    const workspaceRef = useRef(null);
    const activityRef = useRef(null);

    const items = [
        {
            key: '0',
            label: "Arduino",
        },
        {
            key: '1',
            label: "JavaScript",
        },
        {
            key: '2',
            label: "Python",
        },
    ];

    const setWorkspace = () => {
        workspaceRef.current = window.Blockly.inject('blockly-canvas', {
            toolbox: document.getElementById('toolbox'),
        });
    };

    useEffect(() => {
        // once the activity state is set, set the workspace and save
        const setUp = async () => {
            activityRef.current = activity;
            if (!workspaceRef.current && activity && Object.keys(activity).length !== 0) {
                setWorkspace();
            }
        };
        setUp();
    }, [activity]);

    const handleUndo = () => {
        if (workspaceRef.current.undoStack_.length > 0)
            workspaceRef.current.undo(false);
    };


    const handleRedo = () => {
        if (workspaceRef.current.redoStack_.length > 0)
            workspaceRef.current.undo(true);
    };

    const handleConsole = async () => {
        if (showPlotter) {
            message.warning('Close serial plotter before openning serial monitor');
            return;
        }
        // if serial monitor is not shown
        if (!showConsole) {
            // connect to port
            await handleOpenConnection(9600, 'newLine');
            // if fail to connect to port, return
            if (typeof window['port'] === 'undefined') {
                message.error('Fail to select serial device');
                return;
            }
            setConnectionOpen(true);
            setShowConsole(true);
        }
        // if serial monitor is shown, close the connection
        else {
            if (connectionOpen) {
                await handleCloseConnection();
                setConnectionOpen(false);
            }
            setShowConsole(false);
        }
    };

    const handlePlotter = async () => {
        if (showConsole) {
            message.warning('Close serial monitor before openning serial plotter');
            return;
        }

        if (!showPlotter) {
            await handleOpenConnection(
                9600,
                'plot',
                plotData,
                setPlotData,
                plotId,
                forceUpdate
            );
            if (typeof window['port'] === 'undefined') {
                message.error('Fail to select serial device');
                return;
            }
            setConnectionOpen(true);
            setShowPlotter(true);
        } else {
            plotId = 1;
            if (connectionOpen) {
                await handleCloseConnection();
                setConnectionOpen(false);
            }
            setShowPlotter(false);
        }
    };

    const handleCompile = async () => {
        if (showConsole || showPlotter) {
            message.warning(
                'Close Serial Monitor and Serial Plotter before uploading your code'
            );
        } else {
            if (typeof window['port'] === 'undefined') {
                await connectToPort();
            }
            if (typeof window['port'] === 'undefined') {
                message.error('Fail to select serial device');
                return;
            }
            setCompileError('');
            await compileArduinoCode(
                workspaceRef.current,
                setSelectedCompile,
                setCompileError,
                activity,
                false
            );
        }
    };

    // Change language
    const onClick = ({key}) => {
        const newLanguage = items[key].label;

        if (newLanguage !== languageChoicePublic) { // Are we changing language?
            const badBlocks = getIncompatibleBlocks(newLanguage, workspaceRef.current.getAllBlocks());
            if (badBlocks.length === 0 || confirm("There are incompatible blocks that will be removed. Do you wish to continue?")) { // Either have no bad blocks, or have permission to delete them
                message.info(`Activity Language Changed to ${newLanguage}`);
                setLanguageChoice(newLanguage);
                document.getElementById('action-btn-container').style.visibility = (newLanguage === 'Arduino' ? 'visible' : 'hidden');
                workspaceRef.current.updateToolbox(generateToolbox(activity, newLanguage, true));
                badBlocks.forEach((block) => block.dispose());
            }
        }
    };

    const menu = (
        <Menu>
            <Menu.Item onClick={handlePlotter}>
                <PlotterLogo/>
                &nbsp; Show Serial Plotter
            </Menu.Item>
            <CodeModal title={'XML'} workspaceRef={workspaceRef.current}/>
            <Menu.Item>
                <CodeModal title={languageChoicePublic} workspaceRef={workspaceRef.current}/>
            </Menu.Item>
        </Menu>
    );
    const runButton = (
        <Menu>
            <Menu.Item>
                <RunModal title={languageChoicePublic} workspaceRef={workspaceRef.current}/>
            </Menu.Item>
        </Menu>
    );
    const helpButton = (
        <Menu>
            <Menu.Item>
                <HelpModal title={languageChoicePublic} workspaceRef={workspaceRef.current}/>
            </Menu.Item>
        </Menu>
    );


    return (
        <div id='horizontal-container' className='flex flex-column'>
            <div className='flex flex-row'>
                <div
                    id='bottom-container'
                    className='flex flex-column vertical-container overflow-visible'
                >
                    <Spin
                        tip='Compiling Code Please Wait... It may take up to 20 seconds to compile your code.'
                        className='compilePop'
                        size='large'
                        spinning={selectedCompile}
                    >
                        <Row id='icon-control-panel'>
                            <Col flex='none' id='section-header'>
                                Place your Blocks...
                            </Col>
                            <Col flex='auto'>
                                <Row align='middle' justify='end' id='description-container'>
                                    <Col flex={'30px'}>
                                        <Row>
                                            <Col>
                                                <Link id='link' to={'/'} className='flex flex-column'>
                                                    <i className='fa fa-home fa-lg'/>
                                                </Link>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col flex='auto'/>

                                    <Col flex={'400px'}>
                                        <Row>
                                            <Col className='flex flex-row'>
                                                <Dropdown
                                                    id='dropdown'
                                                    menu={{
                                                        items,
                                                        onClick,
                                                    }}
                                                    placement="bottom"
                                                >
                                                    <a onClick={(e) => e.preventDefault()}>
                                                        <Typography.Link>
                                                            <Space>
                                                                {languageChoicePublic}
                                                                <DownOutlined/>
                                                            </Space>
                                                        </Typography.Link>
                                                    </a>
                                                </Dropdown>
                                                <button
                                                    onClick={handleUndo}
                                                    id='link'
                                                    className='flex flex-column'
                                                >
                                                    <i
                                                        id='icon-btn'
                                                        className='fa fa-undo-alt'
                                                        style={
                                                            workspaceRef.current
                                                                ? workspaceRef.current.undoStack_.length < 1
                                                                    ? {color: 'grey', cursor: 'default'}
                                                                    : null
                                                                : null
                                                        }
                                                        onMouseEnter={() => setHoverUndo(true)}
                                                        onMouseLeave={() => setHoverUndo(false)}
                                                    />
                                                    {hoverUndo && (
                                                        <div className='popup ModalCompile4'>Undo</div>
                                                    )}
                                                </button>


                                                <button
                                                    onClick={handleRedo}
                                                    id='link'
                                                    className='flex flex-column'
                                                >
                                                    <i
                                                        id='icon-btn'
                                                        className='fa fa-redo-alt'
                                                        style={
                                                            workspaceRef.current
                                                                ? workspaceRef.current.redoStack_.length < 1
                                                                    ? {color: 'grey', cursor: 'default'}
                                                                    : null
                                                                : null
                                                        }
                                                        onMouseEnter={() => setHoverRedo(true)}
                                                        onMouseLeave={() => setHoverRedo(false)}
                                                    />
                                                    {hoverRedo && (
                                                        <div className='popup ModalCompile4'>Redo</div>
                                                    )}
                                                </button>
                                                <Dropdown overlay={runButton} placement="top">
                                                <i id='icon-btn' className='fa fa-play-circle'></i>
                                            </Dropdown>
                                            <Dropdown overlay={helpButton} placement="top">
                                                <i id='help-btn' className='fa fa-question-circle'></i>
                                            </Dropdown>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col flex={'230px'}>
                                        <div
                                            id='action-btn-container'
                                            className='flex space-around'
                                        >
                                            <ArduinoLogo
                                                setHoverCompile={setHoverCompile}
                                                handleCompile={handleCompile}
                                            />
                                            {hoverCompile && (
                                                <div className='popup ModalCompile'>
                                                    Upload to Arduino
                                                </div>
                                            )}

                                            <i
                                                onClick={() => handleConsole()}
                                                className='fas fa-terminal hvr-info'
                                                style={{marginLeft: '6px'}}
                                                onMouseEnter={() => setHoverConsole(true)}
                                                onMouseLeave={() => setHoverConsole(false)}
                                            />
                                            {hoverConsole && (
                                                <div className='popup ModalCompile'>
                                                    Show Serial Monitor
                                                </div>
                                            )}
                                        </div>


                                    </Col>
                                    <Col flex={'10px'}>
                                        <div
                                            id='action-btn-container'
                                            className='flex space-around'
                                        >
                                            <Dropdown overlay={menu}>
                                                <i className='fas fa-ellipsis-v'></i>
                                            </Dropdown>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <div id='blockly-canvas'/>
                    </Spin>
                </div>
                <ConsoleModal
                    show={showConsole}
                    connectionOpen={connectionOpen}
                    setConnectionOpen={setConnectionOpen}
                ></ConsoleModal>
                <PlotterModal
                    show={showPlotter}
                    connectionOpen={connectionOpen}
                    setConnectionOpen={setConnectionOpen}
                    plotData={plotData}
                    setPlotData={setPlotData}
                    plotId={plotId}
                />
            </div>

            {/* This xml is for the blocks' menu we will provide. Here are examples on how to include categories and subcategories */}
            {generateToolbox(activity, languageChoicePublic)}

            {compileError && (
                <Alert
                    message={compileError}
                    type='error'
                    closable
                    onClose={(e) => setCompileError('')}
                ></Alert>
            )}
        </div>
    );
}
