// Wait for the webpage (DOM) to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELECT ELEMENTS ---
    // Get all needed HTML elements once at the start
    const blocks = document.querySelectorAll('#palette .block'); // draggable code blocks
    const canvas = document.getElementById('canvas');            // drop area
    const runButton = document.getElementById('run-btn');        // run button
    const output = document.getElementById('output');            // output display
    
    console.log('DOM loaded. Initializing listeners...');

    
    // --- 2. DRAG AND DROP LOGIC ---
    // Allow users to drag blocks from the palette to the canvas
    blocks.forEach(block => {

        // When dragging starts
        block.addEventListener('dragstart', (e) => {
            block.classList.add('dragging'); // style change
            e.dataTransfer.setData('text/html', block.outerHTML); // store block HTML
            console.log('Drag started for:', block.dataset.type);
        });

        // When dragging stops
        block.addEventListener('dragend', () => {
            block.classList.remove('dragging');
        });
    });

    // Allow dropping over the canvas
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault(); // necessary for drop to work
        canvas.classList.add('drag-over'); // visual cue
    });

    // When dragged block leaves the canvas area
    canvas.addEventListener('dragleave', () => {
        canvas.classList.remove('drag-over');
    });

    // When block is dropped on the canvas
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.classList.remove('drag-over');
        console.log('Drop event fired on canvas!');

        // Get the HTML of the dragged block
        const blockHTML = e.dataTransfer.getData('text/html');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blockHTML;
        const newBlock = tempDiv.firstElementChild;

        if (!newBlock) {
            console.error('Could not create new block from HTML.');
            return;
        }

        // Make the new block static (not draggable again)
        newBlock.setAttribute('draggable', 'false');
        newBlock.classList.remove('dragging');
        newBlock.classList.add('canvas-block');

        // Prevent text input from interfering with dragging
        const inputs = newBlock.querySelectorAll('.block-input');
        inputs.forEach(input => {
            input.addEventListener('mousedown', (e) => e.stopPropagation());
        });

        // Add the block to the canvas
        canvas.appendChild(newBlock);
        console.log('New block appended to canvas.');
    });


    // --- 3. RUN PROGRAM (INTERPRETER) ---
    runButton.addEventListener('click', () => {
        console.log('Run button clicked!');
        output.textContent = ''; // clear output before running
        
        const blocksOnCanvas = canvas.querySelectorAll('.canvas-block'); // get all placed blocks
        const variables = {};        // variable storage (like memory)
        let skipNextBlock = false;   // used for 'if' and 'else' logic
        let lastIfResult = null;     // remembers if the last 'if' was true or false

        // Helper to display messages in output
        function logToOutput(message) {
            output.textContent += message + '\n';
        }

        // Helper to interpret or evaluate input values
        function evaluate(value) {
            // Return variable value if it exists
            if (variables.hasOwnProperty(value)) return variables[value];
            // Handle string values in quotes
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
                return value.substring(1, value.length - 1);
            // Try to calculate math or number expressions
            try {
                return new Function('return ' + value)();
            } catch {
                return value; // return raw value if evaluation fails
            }
        }

        // --- MAIN PROGRAM EXECUTION LOOP ---
        for (let i = 0; i < blocksOnCanvas.length; i++) {
            const block = blocksOnCanvas[i];
            const blockType = block.dataset.type;
            const inputs = block.querySelectorAll('.block-input');

            // Skip block if previous 'if' was false
            if (skipNextBlock) {
                skipNextBlock = false;
                if (blockType !== 'else') continue; // don't skip an 'else'
            }

            switch (blockType) {
                case 'start':
                    logToOutput('--- Program Start ---');
                    break;
                
                case 'print':
                    // Print text or number
                    logToOutput(evaluate(inputs[0].value));
                    break;

                case 'printVar':
                    // Print variable value
                    const varName = inputs[0].value;
                    if (variables.hasOwnProperty(varName))
                        logToOutput(variables[varName]);
                    else
                        logToOutput(`Error: Variable '${varName}' not found.`);
                    break;
                
                case 'setVar':
                    // Create or update variable
                    const name = inputs[0].value;
                    const value = evaluate(inputs[1].value);
                    variables[name] = value;
                    logToOutput(`(Set ${name} = ${value})`);
                    break;

                case 'loop':
                    // Repeat the next block multiple times
                    const loopCount = evaluate(inputs[0].value);
                    const nextBlock = blocksOnCanvas[i + 1];

                    if (nextBlock && typeof loopCount === 'number' && loopCount > 0) {
                        logToOutput(`Loop ${loopCount} times:`);
                        const nextBlockType = nextBlock.dataset.type;
                        const nextBlockInputs = nextBlock.querySelectorAll('.block-input');

                        // Run the next block repeatedly
                        for (let j = 0; j < loopCount; j++) {
                            if (nextBlockType === 'print')
                                logToOutput('  > ' + evaluate(nextBlockInputs[0].value));
                            else if (nextBlockType === 'printVar') {
                                const vName = nextBlockInputs[0].value;
                                logToOutput('  > ' + (variables.hasOwnProperty(vName) ? variables[vName] : 'Error'));
                            }
                        }
                        i++; // skip the next block since it's already executed inside the loop
                    } else {
                        logToOutput('(Loop block error or no block to loop)');
                    }
                    break;
                
                case 'if':
                    // Simple 'if' condition controlling the next block
                    let condition = inputs[0].value;
                    // Replace variable names with actual values
                    for (let varName in variables) {
                        condition = condition.replace(new RegExp('\\b' + varName + '\\b', 'g'), variables[varName]);
                    }

                    try {
                        const result = new Function('return ' + condition)();
                        logToOutput(`If (${condition}) is ${result}`);
                        lastIfResult = result;
                        if (!result) skipNextBlock = true; // skip next if condition is false
                    } catch (e) {
                        logToOutput(`Error in If condition: ${e.message}`);
                        skipNextBlock = true;
                        lastIfResult = false;
                    }
                    break;
                
                case 'else':
                    // 'Else' executes only if the previous 'if' was false
                    logToOutput('Else');
                    if (lastIfResult === null) {
                        logToOutput('Error: "Else" block without a preceding "If" block.');
                        skipNextBlock = true;
                    } else if (lastIfResult === true) {
                        skipNextBlock = true; // skip if previous 'if' was true
                    } else {
                        skipNextBlock = false; // run if previous 'if' was false
                    }
                    lastIfResult = null; // reset flag
                    break;
            }
        }
    });

}); // --- End of DOMContentLoaded ---
