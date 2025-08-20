// script.js

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // --- Grid cell dimensions (must match CSS) ---
    const actualGridRowHeight = 45; // Matches .line::before height in CSS
    const actualGridColWidth = 20;  // Matches grid-template-columns in CSS
    // --- END Grid cell dimensions ---

    // --- Interaction parameters ---
    const interactionRadius = 100; // Fixed radius in pixels around the cursor/finger to affect lines
    const maxMoveDistance = 40;    // Maximum horizontal movement for a line in pixels
    // --- END Interaction parameters ---

    let inputPos = { x: 0, y: 0 }; // Stores current input (mouse or touch) position
    let lineElements = [];         // Stores all line DOM elements

    // Function to clear all existing lines and animations
    const clearAllLineAnimations = () => {
        // No ongoing animations to manage with the new approach,
        // just clearing the grid and repopulating.
    };

    // Function to populate the grid with lines
    const populateGrid = () => {
        clearAllLineAnimations();
        gridContainer.innerHTML = ''; // Clear existing lines

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate how many rows and columns fit in the viewport
        const rowsThatFit = Math.floor(viewportHeight / actualGridRowHeight);
        const colsThatFit = Math.floor(viewportWidth / actualGridColWidth);

        const numLinesToCreate = rowsThatFit * colsThatFit;

        lineElements = []; // Reset the array of line elements

        for (let i = 0; i < numLinesToCreate; i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            gridContainer.appendChild(line);
            lineElements.push(line); // Add line to our array
        }
        // After populating, immediately update positions based on current input.
        updateLinePositions();
    };

    // Function to update the position of each line based on input proximity
    // It now uses the fixed interactionRadius.
    const updateLinePositions = () => {
        // Iterate over all line elements
        lineElements.forEach(line => {
            // Get the bounding rectangle of the line element
            const rect = line.getBoundingClientRect();
            // Calculate the center coordinates of the line element
            const lineCenterX = rect.left + rect.width / 2;
            const lineCenterY = rect.top + rect.height / 2;

            // Calculate the distance between the input and the line's center
            const dx = inputPos.x - lineCenterX;
            const dy = inputPos.y - lineCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let translateX = 0; // Default translation is 0 (no movement)

            // Check if the line is within the fixed interaction radius
            if (distance < interactionRadius) {
                // Calculate the influence based on distance (closer = more influence)
                // This value goes from 1 (at center) to 0 (at interactionRadius edge)
                const influence = 1 - (distance / interactionRadius);

                // Determine the direction of movement
                const direction = Math.sign(dx);

                // To make lines avoid the input, we reverse the direction
                translateX = -direction * influence * maxMoveDistance;
            }

            // Apply the transform to the line element
            // The CSS transition property handles the smooth ease-in-out effect
            line.style.transform = `translateX(${translateX}px)`;
        });
    };

    // Event listener for touch movement
    window.addEventListener('touchmove', (e) => {
        // Prevent default touch behavior (e.g., scrolling)
        e.preventDefault();
        // Get the coordinates of the first touch point
        const touch = e.touches[0];
        inputPos.x = touch.clientX;
        inputPos.y = touch.clientY;
        updateLinePositions();
    }, { passive: false }); // Use passive: false to allow preventDefault

    // Event listener for mouse movement (retained for desktop)
    window.addEventListener('mousemove', (e) => {
        inputPos.x = e.clientX;
        inputPos.y = e.clientY;
        updateLinePositions();
    });

    // Initial population of the grid when the DOM is loaded
    populateGrid();

    // Event listener for window resize to re-populate the grid and update positions
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            populateGrid();
            // After resize, update line positions with the fixed radius.
            updateLinePositions();
        }, 200); // Debounce resize to prevent excessive re-renders
    });
});
