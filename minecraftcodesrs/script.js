// Select elements
const textInput = document.getElementById('text');
const colorPicker = document.getElementById('color-picker');
const styleButtons = document.getElementById('style-buttons');
const output = document.getElementById('output');
const preview = document.getElementById('preview');

// Map of Minecraft color codes to actual colors
const colorMap = {
    '&0': '#000000', // Black
    '&1': '#0000aa', // Dark Blue
    '&2': '#00aa00', // Dark Green
    '&3': '#00aaaa', // Dark Aqua
    '&4': '#aa0000', // Dark Red
    '&5': '#aa00aa', // Dark Purple
    '&6': '#ffaa00', // Gold
    '&7': '#aaaaaa', // Gray
    '&8': '#555555', // Dark Gray
    '&9': '#5555ff', // Blue
    '&a': '#55ff55', // Green
    '&b': '#55ffff', // Aqua
    '&c': '#ff5555', // Red
    '&d': '#ff55ff', // Light Purple
    '&e': '#ffff55', // Yellow
    '&f': '#ffffff', // White
};

// Generate the Minecraft color code and update output/preview
function updateOutput() {
    const text = textInput.value;

    // Update the output
    output.textContent = text;

    // Update the preview
    preview.innerHTML = text
        .split(/(&[0-9a-fklmnor])/g) // Split by Minecraft color and style codes
        .map((segment) => {
            const codeMatch = segment.match(/&([0-9a-fklmnor])/);
            if (codeMatch) {
                const code = codeMatch[1];
                const color = colorMap[`&${code}`] || null;
                const style = {
                    l: 'font-weight:bold;',
                    n: 'text-decoration:underline;',
                    k: 'font-style:italic;', // Replace with 'text-decoration: obfuscate;' if supported
                    r: 'font-weight:normal;text-decoration:none;color:#fff;', // Reset styles
                }[code] || (color ? `color:${color};` : '');
                return `<span style="${style}">`; // Open span with the style
            }
            return `${segment}</span>`; // Close span tag for plain text
        })
        .join(''); // Join back all segments
}

// Build the color picker
function buildColorPicker() {
    Object.entries(colorMap).forEach(([code, color]) => {
        const div = document.createElement('div');
        div.className = 'color-block';
        div.style.backgroundColor = color;
        div.dataset.code = code;
        div.textContent = code;
        div.addEventListener('click', () => applyCode(code));
        colorPicker.appendChild(div);
    });
}

// Apply the selected color or style to the text
function applyCode(code) {
    const selectionStart = textInput.selectionStart;
    const selectionEnd = textInput.selectionEnd;

    // Insert the code at the cursor or wrap the selected text
    const text = textInput.value;
    const formattedText = `${text.slice(0, selectionStart)}${code}${text.slice(selectionStart, selectionEnd)}${text.slice(selectionEnd)}`;
    textInput.value = formattedText;

    // Move cursor to the end of the inserted code
    textInput.focus();
    textInput.setSelectionRange(selectionEnd + code.length, selectionEnd + code.length);
    updateOutput();
}

// Setup style buttons for Bold, Underline, Italics, and Reset
function setupStyleButtons() {
    const buttons = [
        { id: 'bold', code: '&l' }, // Bold
        { id: 'underline', code: '&n' }, // Underline
        { id: 'italic', code: '&k' }, // Italic
        { id: 'reset', code: '&r' }, // Reset
    ];

    buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = button.id;
        buttonElement.addEventListener('click', () => applyCode(button.code));
        styleButtons.appendChild(buttonElement);
    });
}

// Event listeners
textInput.addEventListener('input', updateOutput);

// Initial setup
buildColorPicker();
setupStyleButtons();
updateOutput();
