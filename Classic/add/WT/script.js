const gridSpacing = 100; // Set grid cell size
const occupiedPositions = {}; // Track occupied grid positions
const taskbar = document.getElementById("taskbar");
const openAppsContainer = document.getElementById("open-apps");

let openedWindows = [];

// Initialize icons with drag and double-click functionality
document.querySelectorAll('.icon').forEach((icon, index) => {
    icon.dataset.iconIndex = index; // Assign a unique index to each icon
    dragElement(icon);
    icon.addEventListener('dblclick', () => {
        const windowId = icon.dataset.windowId;
        openWindow(windowId);
    });
    
    // Arrange icons on initial load to avoid overlap
    const initialPosition = findNextAvailablePosition(0, 0);
    icon.style.left = `${initialPosition.left}px`;
    icon.style.top = `${initialPosition.top}px`;
    occupiedPositions[`${initialPosition.left}-${initialPosition.top}`] = icon.dataset.iconIndex;
});

function dragElement(element) {
    let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
    const header = element.classList.contains('window') ? element.querySelector(".window-header") : element;
    let dragged = false;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        dragged = false;

        // Release the current position in `occupiedPositions`
        const prevLeft = parseInt(element.style.left, 10);
        const prevTop = parseInt(element.style.top, 10);
        delete occupiedPositions[`${prevLeft}-${prevTop}`];

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        posX = mouseX - e.clientX;
        posY = mouseY - e.clientY;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        element.style.top = (element.offsetTop - posY) + "px";
        element.style.left = (element.offsetLeft - posX) + "px";

        if (posX !== 0 || posY !== 0) {
            dragged = true;
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;

        // Only adjust position if the element was actually dragged
        if (dragged) {
            // Snap to the nearest grid cell and find an available position
            const snappedPosition = snapToGrid(element.offsetLeft, element.offsetTop);
            const finalPosition = findNextAvailablePosition(snappedPosition.left, snappedPosition.top);
            element.style.left = `${finalPosition.left}px`;
            element.style.top = `${finalPosition.top}px`;

            // Mark the new position as occupied
            occupiedPositions[`${finalPosition.left}-${finalPosition.top}`] = element.dataset.iconIndex;
        } else {
            // If not dragged, restore the original position as occupied
            const originalLeft = parseInt(element.style.left, 10);
            const originalTop = parseInt(element.style.top, 10);
            occupiedPositions[`${originalLeft}-${originalTop}`] = element.dataset.iconIndex;
        }
    }
}

// Snap to the nearest grid position
function snapToGrid(x, y) {
    const newX = Math.round(x / gridSpacing) * gridSpacing;
    const newY = Math.round(y / gridSpacing) * gridSpacing;
    return { left: newX, top: newY };
}

// Find the next available grid position, avoiding any occupied positions
function findNextAvailablePosition(x, y) {
    let newX = x;
    let newY = y;

    // Check if the current position is occupied
    while (occupiedPositions[`${newX}-${newY}`]) {
        newX += gridSpacing;
        if (newX > window.innerWidth - gridSpacing) { // Move to the next row if needed
            newX = 0;
            newY += gridSpacing;
        }
    }
    return { left: newX, top: newY };
}

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.style.display = "block";
    dragElement(windowElement);

    // Bring the clicked window to the front
    document.querySelectorAll('.window').forEach((w) => w.style.zIndex = 5);
    windowElement.style.zIndex = 10;

    // Add to the taskbar
    if (!openedWindows.includes(windowId)) {
        openedWindows.push(windowId);
        addAppToTaskbar(windowId);
    }
}

function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.style.display = "none";

    // Remove from the taskbar
    openedWindows = openedWindows.filter((id) => id !== windowId);
    removeAppFromTaskbar(windowId);
}

function addAppToTaskbar(windowId) {
    const appButton = document.createElement('div');
    appButton.classList.add('taskbar-app');
    appButton.innerHTML = windowId === 'window1' ? 'Folder' : windowId === 'window2' ? 'App' : 'Settings';
    appButton.onclick = () => openWindow(windowId);
    openAppsContainer.appendChild(appButton);
}

function removeAppFromTaskbar(windowId) {
    const appButton = Array.from(openAppsContainer.children).find((btn) => btn.innerText === (windowId === 'window1' ? 'Folder' : windowId === 'window2' ? 'App' : 'Settings'));
    if (appButton) {
        openAppsContainer.removeChild(appButton);
    }
}

function toggleStartMenu() {
    const startMenu = document.getElementById("start-menu");
    startMenu.classList.toggle("hidden");
}

function minimizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.style.display = "none";
}

function maximizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.style.height = "80%";
    windowElement.style.width = "80%";
    windowElement.style.top = "10%";
    windowElement.style.left = "10%";
}

function changeTaskbarColor(event) {
    taskbar.style.backgroundColor = event.target.value;
}
