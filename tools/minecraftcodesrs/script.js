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

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

// Generate the Minecraft color code and update output/preview
function updateOutput() {
    const text = textInput.value;

    // Update the output
    output.textContent = text;

    // Update the preview
    preview.innerHTML = '<span>' + text
        .split(/(&[0-9a-fklmnor])/gi)
        .map(segment => {
            const codeMatch = segment.match(/^&([0-9a-fklmnor])$/i);
            if (!codeMatch) return escapeHtml(segment);
            const code = codeMatch[1].toLowerCase();
            const color = colorMap[`&${code}`];
            const style = {
                l: 'font-weight:bold;',
                n: 'text-decoration:underline;',
                k: 'font-style:italic;',
                r: 'font-weight:normal;text-decoration:none;color:#fff;',
            }[code] || (color ? `color:${color};` : '');
            return `</span><span style="${style}">`;
        })
        .join('') + '</span>';
}

// Build the color picker
function buildColorPicker() {
    Object.entries(colorMap).forEach(([code, color]) => {
        const div = document.createElement('div');
        div.className = 'color-block';
        div.style.backgroundColor = color;
        const lin = [1, 3, 5].map(i => {
            const v = parseInt(color.slice(i, i + 2), 16) / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
        const useDark = (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05);
        div.style.color = useDark ? '#000' : '#fff';
        div.style.textShadow = 'none';
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
