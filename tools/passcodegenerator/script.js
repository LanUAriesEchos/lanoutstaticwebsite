// Function to generate passcode based on input
function generatePasscode() {
    let passcode = '';
    const length = document.getElementById('lengthSlider').value;

    if (document.getElementById('customInputToggle').checked) {
        // If custom text is enabled
        const customText = document.getElementById('customText').value;
        if (customText) {
            passcode = obfuscateText(customText, length);
        }
    } else {
        // If custom text is not enabled, generate a random passcode
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            passcode += characters[randomIndex];
        }
    }

    document.getElementById('passcode').value = passcode;
    document.getElementById('lengthValue').textContent = length;
}

// Function to obfuscate the custom input text
function obfuscateText(text, length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let obfuscated = '';

    // Scramble custom text by shuffling characters
    let shuffledText = text.split('').sort(() => Math.random() - 0.5).join('');
    
    // If the shuffled text is longer than the selected length, slice it
    obfuscated = shuffledText.slice(0, length);
    
    // If the shuffled text is shorter than the selected length, fill with random characters
    while (obfuscated.length < length) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        obfuscated += characters[randomIndex];
    }

    // Apply leetspeak if enabled
    if (document.getElementById('leetspeakToggle').checked) {
        obfuscated = applyLeetspeak(obfuscated);
    }

    // Scramble the passcode if the scramble option is enabled
    if (document.getElementById('scrambleToggle').checked) {
        obfuscated = scramblePasscode(obfuscated);
    }

    return obfuscated;
}

// Function to apply leetspeak to a text
function applyLeetspeak(text) {
    const leetspeakMap = {
        'a': '4', 'b': '8', 'e': '3', 'g': '6', 'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'z': '2'
    };
    
    return text.split('').map(char => leetspeakMap[char.toLowerCase()] || char).join('');
}

// Function to scramble a passcode
function scramblePasscode(text) {
    return text.split('').sort(() => Math.random() - 0.5).join('');
}

// Event listener to toggle custom text input visibility
document.getElementById('customInputToggle').addEventListener('change', function() {
    const customTextContainer = document.getElementById('customTextContainer');
    const leetspeakContainer = document.getElementById('leetspeakContainer');
    const scrambleContainer = document.getElementById('scrambleContainer');
    const sliderContainer = document.getElementById('sliderContainer');
    const generateButton = document.getElementById('generateButton');

    if (this.checked) {
        customTextContainer.style.display = 'block';
        leetspeakContainer.style.display = 'block';
        scrambleContainer.style.display = 'block';
        sliderContainer.style.display = 'none'; // Hide the slider when using custom text
        generateButton.disabled = !isValidCustomInput(); // Enable button only when valid custom text or scramble is selected
    } else {
        customTextContainer.style.display = 'none';
        leetspeakContainer.style.display = 'none';
        scrambleContainer.style.display = 'none';
        sliderContainer.style.display = 'flex'; // Show the slider when not using custom text
        generateButton.disabled = false; // Re-enable the button
        generatePasscode(); // Automatically generate a random passcode when custom text is disabled
    }
});

// Event listener for changes in custom text or scramble checkbox to enable/disable the button
document.getElementById('customText').addEventListener('input', function() {
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !isValidCustomInput(); // Disable button if no valid custom input or scramble is selected
});

document.getElementById('scrambleToggle').addEventListener('change', function() {
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !isValidCustomInput(); // Disable button if no valid custom input or scramble is selected
});

// Function to check if valid custom input is provided
function isValidCustomInput() {
    const customText = document.getElementById('customText').value;
    return customText.trim().length > 0 || document.getElementById('scrambleToggle').checked;
}

// Optional: Automatically update passcode length display when slider changes
document.getElementById('lengthSlider').addEventListener('input', function() {
    document.getElementById('lengthValue').textContent = this.value;
});

// Initial random passcode generation when the page loads
window.onload = function() {
    // Enable the generate button
    document.getElementById('generateButton').disabled = false;

    // Generate a random passcode when the page loads
    generatePasscode();
};
