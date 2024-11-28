const siteList = document.getElementById('site-list');
const siteInput = document.getElementById('site-input');
const nameInput = document.getElementById('name-input');
const addSiteButton = document.getElementById('add-site-button');
const saveSitesButton = document.getElementById('save-sites-button');
const loadSitesButton = document.getElementById('load-sites-button');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
const errorMessage = document.getElementById('error-message');
const clockElement = document.getElementById('clock');
const timeFormatToggle = document.getElementById('time-format-toggle');

const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const modalTimeFormatToggle = document.getElementById('modal-time-format-toggle');

let sites = JSON.parse(localStorage.getItem('savedSites')) || []; // Load from localStorage
let is24HourFormat = JSON.parse(localStorage.getItem('is24HourFormat')) || false; // Load time format preference
let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false; // Load dark mode preference

// Set time format and dark mode toggles based on saved preferences
timeFormatToggle.checked = is24HourFormat;
modalTimeFormatToggle.checked = is24HourFormat; // Sync modal toggle
darkModeToggle.checked = isDarkMode;
if (isDarkMode) {
    document.body.classList.add('dark-mode');
}

// Function to update the clock
function updateClock() {
    const now = new Date();
    const hours = is24HourFormat ? now.getHours() : now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = is24HourFormat ? '' : (now.getHours() >= 12 ? ' PM' : ' AM');
    clockElement.textContent = `${hours}:${minutes}:${seconds}${ampm}`;
}
setInterval(updateClock, 1000);
updateClock(); // Initial call to show clock immediately

// Toggle 24-hour format
timeFormatToggle.onchange = () => {
    is24HourFormat = timeFormatToggle.checked;
    localStorage.setItem('is24HourFormat', is24HourFormat);
    updateClock();
};

// Handle dark mode toggle
darkModeToggle.onchange = () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    } else {
        document.body.classList.remove('dark-mode');
        isDarkMode = false;
    }
    localStorage.setItem('isDarkMode', isDarkMode);
};

// Open settings modal
settingsButton.onclick = () => {
    modalTimeFormatToggle.checked = is24HourFormat; // Sync modal toggle with the main toggle
    settingsModal.style.display = 'flex';
};

// Close modal when clicking the 'x' or outside the modal content
closeModal.onclick = () => settingsModal.style.display = 'none';
window.onclick = (event) => {
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
};

// 24-Hour Format toggle in modal
modalTimeFormatToggle.onchange = () => {
    is24HourFormat = modalTimeFormatToggle.checked;
    localStorage.setItem('is24HourFormat', is24HourFormat);
    updateClock();
};

// Add a new site
addSiteButton.onclick = () => {
    const siteUrl = siteInput.value.trim();
    const siteName = nameInput.value.trim();
    if (siteUrl && siteName) {
        try {
            new URL(siteUrl); // Validate URL
            sites.push({ url: siteUrl, name: siteName });
            updateSiteList();
            saveSitesToLocalStorage();
            siteInput.value = '';
            nameInput.value = '';
            clearError();
        } catch {
            showError("Please enter a valid URL.");
        }
    } else {
        showError("Both fields are required.");
    }
};

// Save sites to a JSON file
saveSitesButton.onclick = () => {
    const blob = new Blob([JSON.stringify(sites)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sites.json";
    a.click();
    URL.revokeObjectURL(url);
};

// Load sites from a JSON file
loadSitesButton.onclick = () => fileInput.click();
fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                sites = JSON.parse(e.target.result);
                updateSiteList();
                saveSitesToLocalStorage();
                clearError();
            } catch {
                showError("Error loading file. Please ensure it is a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }
};

// Search sites
searchInput.oninput = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredSites = sites.filter(site => site.name.toLowerCase().includes(searchTerm) || site.url.toLowerCase().includes(searchTerm));
    updateSiteList(filteredSites);
};

// Update the site list in the UI
function updateSiteList(filteredSites = sites) {
    siteList.innerHTML = '';
    filteredSites.forEach((site, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="editable">
                <img src="https://www.google.com/s2/favicons?domain=${site.url}" class="favicon" alt="Favicon" />
                <a href="${site.url}" target="_blank">${site.name}</a>
            </div>
            <div class="edit-controls">
                <button onclick="editSite(${index})">Edit</button>
                <button onclick="deleteSite(${index})">Delete</button>
            </div>
        `;
        siteList.appendChild(li);
    });
}

// Save sites to localStorage
function saveSitesToLocalStorage() {
    localStorage.setItem('savedSites', JSON.stringify(sites));
}

// Edit a site
window.editSite = (index) => {
    const site = sites[index];
    const newUrl = prompt("Enter new URL", site.url);
    const newName = prompt("Enter new name", site.name);
    if (newUrl && newName) {
        try {
            new URL(newUrl); // Validate URL
            sites[index] = { url: newUrl, name: newName };
            updateSiteList();
            saveSitesToLocalStorage();
            clearError();
        } catch {
            showError("Please enter a valid URL.");
        }
    }
};
const updatesButton = document.getElementById('updates-button');
updatesButton.onclick = () => {
window.open('updates.html', 'UpdatesPopup', 'width=600,height=400,scrollbars=yes,resizable=yes');
};
// Delete a site
window.deleteSite = (index) => {
    if (confirm("Are you sure you want to delete this site?")) {
        sites.splice(index, 1);
        updateSiteList();
        saveSitesToLocalStorage();
    }
};

// Display an error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Clear the error message
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// Load saved sites on page load
updateSiteList();
