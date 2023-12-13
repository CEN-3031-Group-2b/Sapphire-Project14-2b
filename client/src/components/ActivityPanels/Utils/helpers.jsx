import {
    createSubmission,
    getSubmission,
    saveWorkspace,
    updateActivityLevelTemplate,
    createAuthorizedWorkspace,
    updateAuthorizedWorkspace,
    updateActivityTemplate,
} from '../../../Utils/requests';
import {message} from 'antd';
import React from "react";
import ReactDOMServer from "react-dom/server";

const AvrboyArduino = window.AvrgirlArduino;

export const setLocalSandbox = (workspaceRef) => {
    let workspaceDom = window.Blockly.Xml.workspaceToDom(workspaceRef);
    let workspaceText = window.Blockly.Xml.domToText(workspaceDom);
    const localActivity = JSON.parse(localStorage.getItem('sandbox-activity'));

    let lastActivity = {...localActivity, template: workspaceText};
    localStorage.setItem('sandbox-activity', JSON.stringify(lastActivity));
};

// Generates xml from blockly canvas
export const getXml = (workspaceRef, shouldAlert = true) => {
    const {Blockly} = window;

    let xml = Blockly.Xml.workspaceToDom(workspaceRef);
    let xml_text = Blockly.Xml.domToText(xml);
    if (shouldAlert) alert(xml_text);
    return xml_text;
};

// Generates javascript code from blockly canvas
export const getJS = (workspaceRef, shouldAlert = true) => {
    window.Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    let code = window.Blockly.JavaScript.workspaceToCode(workspaceRef);
    // console.log(window.Blockly.JavaScript.blockToCode);
    if (shouldAlert) alert(code);
    return code;
};

// Generates python code from blockly canvas
export const getPython = (workspaceRef) => {
    window.Blockly.Python.INFINITE_LOOP_TRAP = null;
    let code = window.Blockly.Python.workspaceToCode(workspaceRef);
    return code;
};

// Generates Arduino code from blockly canvas
export const getArduino = (workspaceRef, shouldAlert = true) => {
    window.Blockly.Arduino.INFINITE_LOOP_TRAP = null;
    let code = window.Blockly.Arduino.workspaceToCode(workspaceRef);
    if (shouldAlert) alert(code);
    return code;
};

let intervalId;
const compileFail = (setSelectedCompile, setCompileError, msg) => {
    setSelectedCompile(false);
    message.error('Compile Fail', 3);
    setCompileError(msg);
};
// Sends compiled arduino code to server and returns hex to flash board with
export const compileArduinoCode = async (
    workspaceRef,
    setSelectedCompile,
    setCompileError,
    activity,
    isStudent
) => {
    setSelectedCompile(true);
    const sketch = getArduino(workspaceRef, false);
    let workspaceDom = window.Blockly.xml.workspaceToDom(workspaceRef);
    let workspaceText = window.Blockly.xml.domToText(workspaceDom);
    let path;
    isStudent ? (path = '/submissions') : (path = '/sandbox/submission');
    let id = isStudent ? activity.id : undefined;

    // create an initial submission
    const initialSubmission = await createSubmission(
        id,
        workspaceText,
        sketch,
        path,
        isStudent
    );

    // if we fail to create submission
    if (!initialSubmission.data) {
        compileFail(
            setSelectedCompile,
            setCompileError,
            'Oops. Something went wrong, please check your internet connection.'
        );
        return;
    }
    // Get the submission Id and send a request to get the submission every
    // 0.25 second until the submission status equal to COMPLETE.
    intervalId = setInterval(
        () =>
            getAndFlashSubmission(
                initialSubmission.data.id,
                path,
                isStudent,
                setSelectedCompile,
                setCompileError
            ),
        250
    );

    // Set a timeout of 20 second. If the submission status fail to update to
    // COMPLETE, show error.
    setTimeout(() => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
            compileFail(
                setSelectedCompile,
                setCompileError,
                'Oops. Something went wrong, please try again.'
            );
        }
    }, 20000);
};

const getAndFlashSubmission = async (
    id,
    path,
    isStudent,
    setSelectedCompile,
    setCompileError
) => {
    // get the submission
    const response = await getSubmission(id, path, isStudent);
    // If we fail to retrive submission
    if (!response.data) {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
        compileFail(
            setSelectedCompile,
            setCompileError,
            'Oops. Something went wrong, please check your internet connection.'
        );
        return;
    }

    // if the submission is not complete, try again later
    if (response.data.status !== 'COMPLETED') {
        return;
    }

    // If the submission is ready
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
    }
    // flash the board with the output
    await flashArduino(response, setSelectedCompile, setCompileError);
};

const flashArduino = async (response, setSelectedCompile, setCompileError) => {
    if (response.data) {
        // if we get a success status from the submission, send it to arduino
        if (response.data.success) {
            // converting base 64 to hex
            let Hex = atob(response.data.hex).toString();

            const avrgirl = new AvrboyArduino({
                board: 'uno',
                debug: true,
            });

            avrgirl.flash(Hex, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('done correctly.');
                    message.success('Compile Success', 3);
                    setSelectedCompile(false);
                }
            });
        }
        // else if there is error on the Arduino code, show error
        else if (response.data.stderr) {
            message.error('Compile Fail', 3);
            setSelectedCompile(false);
            setCompileError(response.data.stderr);
        }
    } else {
        message.error(response.err);
    }
};

// save current workspace
export const handleSave = async (activityId, workspaceRef, replay) => {
    let xml = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
    let xml_text = window.Blockly.Xml.domToText(xml);
    return await saveWorkspace(activityId, xml_text, replay);
};

export const handleCreatorSaveActivityLevel = async (activityId, workspaceRef, blocksList) => {
    let xml = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
    let xml_text = window.Blockly.Xml.domToText(xml);

    return await updateActivityLevelTemplate(activityId, xml_text, blocksList);
};

export const handleCreatorSaveActivity = async (activityId, workspaceRef) => {
    let xml = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
    let xml_text = window.Blockly.Xml.domToText(xml);

    return await updateActivityTemplate(activityId, xml_text);
};

export const handleSaveAsWorkspace = async (
    name,
    description,
    workspaceRef,
    blocksList,
    classroomId
) => {
    if (!blocksList) {
        blocksList = [];
    }

    let xml = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
    let xml_text = window.Blockly.Xml.domToText(xml);

    return await createAuthorizedWorkspace(
        name,
        description,
        xml_text,
        blocksList,
        classroomId
    );
};

export const handleUpdateWorkspace = async (id, workspaceRef, blocksList) => {
    if (!blocksList) {
        blocksList = [];
    }
    let xml = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
    let xml_text = window.Blockly.Xml.domToText(xml);

    return await updateAuthorizedWorkspace(id, xml_text, blocksList);
};


const programmingBlocks = [
    "controls_flow_statements",
    "controls_for",
    "controls_forEach",
    "controls_if",
    "controls_repeat",
    "controls_whileUntil",
    "logic_boolean",
    "logic_compare",
    "logic_negate",
    "logic_null",
    "logic_operation",
    "logic_ternary",
    "math_arithmetic",
    "math_change",
    "math_constant",
    "math_constrain",
    "math_modulo",
    "math_number",
    "math_number_property",
    "math_on_list",
    "math_random_float",
    "math_random_int",
    "math_round",
    "math_single",
    "math_trig",
    "procedures_callnoreturn",
    "procedures_callreturn",
    "procedures_defnoreturn",
    "procedures_defreturn",
    "procedures_ifreturn",
    "text",
    "text_append",
    "text_charAt",
    "text_getSubstring",
    "text_isEmpty",
    "text_join",
    "text_length",
    "text_print",
    "text_prompt_ext",
    "variables_get",
    "variables_set"
];

export const getIncompatibleBlocks = (language, blocks) =>
    (language === "Arduino" ? [] : blocks.filter((block) => !programmingBlocks.includes(block.type)));

export const generateToolbox = (activity, language, asString = false) => {
    const toolbox = <xml id='toolbox' is='Blockly workspace'>
        {
            // Maps out block categories
            activity &&
            activity.toolbox &&
            activity.toolbox
                .map(([category, blocks]) => ([category, blocks.filter( // filters out blocks when language is not Arduino
                    (block) => language === "Arduino" || programmingBlocks.includes(block.name)
                )]))
                .filter(([, blocks]) => blocks.length > 0) // filters out categories with no blocks
                .map(([category, blocks]) => ( // maps out categories with blocks
                        <category name={category} is='Blockly category' key={category}>
                            {
                                blocks.map((block) =>
                                    <block
                                        type={block.name}
                                        is='Blockly block'
                                        key={block.name}
                                    />
                                )
                            }
                        </category>
                    )
                )
        }
    </xml>;

    if (asString)
        return ReactDOMServer.renderToStaticMarkup(toolbox);
    return toolbox;
}