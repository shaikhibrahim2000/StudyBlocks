// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements
    const blocks = document.querySelectorAll('#palette .block');
    const canvas = document.getElementById('canvas');
    
    console.log('DOM loaded. Found', blocks.length, 'blocks and canvas:', canvas);

// Add drag event listeners to each block in the palette
blocks.forEach(block => {
    // Fired when the user starts dragging a block
    block.addEventListener('dragstart', (e) => {
        block.classList.add('dragging');
        // Store both the HTML and the block type for better reliability
        e.dataTransfer.setData('text/html', block.outerHTML);
        e.dataTransfer.setData('text/plain', block.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
        console.log('Drag started for:', block.dataset.type);
    });

    // Fired when the user stops dragging the block
    block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
    });
});

// Fired continuously while a dragged element is over the canvas
canvas.addEventListener('dragover', (e) => {
    // This is crucial to allow a drop to occur
    e.preventDefault();
    canvas.classList.add('drag-over');
});

// Fired when a dragged element leaves the canvas
canvas.addEventListener('dragleave', (e) => {
    // Only remove the class if we're actually leaving the canvas (not just moving to a child element)
    if (!canvas.contains(e.relatedTarget)) {
        canvas.classList.remove('drag-over');
    }
});

// Fired when a dragged element is dropped on the canvas
canvas.addEventListener('drop', (e) => {
    e.preventDefault(); // This prevents the browser's default drop behavior
    e.stopPropagation(); // Stop the event from bubbling up
    canvas.classList.remove('drag-over');
    console.log('Drop event fired on canvas!');

    // Try to get the block data we stored in dragstart
    let blockHTML = e.dataTransfer.getData('text/html');
    const blockType = e.dataTransfer.getData('text/plain');
    
    console.log('Retrieved HTML:', blockHTML);
    console.log('Retrieved type:', blockType);

    // If HTML retrieval failed, try to recreate from type
    if (!blockHTML && blockType) {
        console.log('HTML retrieval failed, recreating from type:', blockType);
        const originalBlock = document.querySelector(`[data-type="${blockType}"]`);
        if (originalBlock) {
            blockHTML = originalBlock.outerHTML;
        }
    }

    if (!blockHTML) {
        console.error('Could not retrieve block data.');
        return;
    }

    // Create a new element from the stored HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = blockHTML;
    
    // Using firstElementChild is safer than firstChild, as it ignores whitespace nodes
    const newBlock = tempDiv.firstElementChild;
    
    if (!newBlock) {
        console.error('Could not create new block from HTML.');
        return;
    }

    // The new block on the canvas should not be draggable again
    newBlock.setAttribute('draggable', 'false');
    newBlock.classList.remove('dragging');
    newBlock.classList.add('canvas-block');

    // Add some styling to show it's been placed
    newBlock.style.margin = '10px 0';
    newBlock.style.opacity = '1';

    // Append the new, copied block to the canvas
    canvas.appendChild(newBlock);
    console.log('New block appended to canvas:', newBlock);
});

}); // End of DOMContentLoaded

