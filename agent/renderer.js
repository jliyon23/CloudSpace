// --- renderer.js (Renderer Process) ---

const logElement = document.getElementById('log');
const directoriesListElement = document.getElementById('directoriesList');
const addDirectoryButton = document.getElementById('addDirectory');
const agentTokenInput = document.getElementById('agentTokenInput');
const saveTokenButton = document.getElementById('saveTokenButton');

// --- Log Handling ---
function logMessage(message, isError = false) {
    const div = document.createElement('div');
    div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (isError) {
        div.classList.add('text-red-500');
    }
    logElement.appendChild(div);
    logElement.scrollTop = logElement.scrollHeight;
}

// --- Directory Management ---
async function updateDirectoriesList() {
    const directories = await window.electronAPI.getMonitoredDirectories();
    directoriesListElement.innerHTML = '';
    directories.forEach(dir => {
        const listItem = document.createElement('li');
        listItem.className = 'flex justify-between items-center p-2 hover:bg-zinc-800 rounded';
        
        const dirText = document.createElement('span');
        dirText.textContent = dir;
        dirText.className = 'truncate flex-1';
        listItem.appendChild(dirText);
        
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&times;';
        removeButton.className = 'ml-2 px-2 text-red-500 hover:text-red-300 focus:outline-none';
        removeButton.onclick = async (e) => {
            e.stopPropagation();
            await window.electronAPI.removeDirectory(dir);
            updateDirectoriesList();
            logMessage(`Removed directory: ${dir}`);
        };
        listItem.appendChild(removeButton);
        directoriesListElement.appendChild(listItem);
    });
}

// --- Agent Token Handling ---
async function loadSavedToken() {
    const token = await window.electronAPI.getSavedToken();
    if (token) {
        agentTokenInput.value = token;
        logMessage('Agent token loaded from storage');
    }
}

// --- Event Listeners ---
window.electronAPI.onLogMessage(logMessage);

addDirectoryButton.addEventListener('click', async () => {
    const newDir = await window.electronAPI.addDirectory();
    if (newDir) {
        updateDirectoriesList();
        logMessage(`Added new directory: ${newDir}`);
    }
});

saveTokenButton.addEventListener('click', async () => {
    const token = agentTokenInput.value.trim();
    if (token) {
        await window.electronAPI.submitAgentToken(token);
        logMessage('Agent token saved and monitoring started');
    } else {
        logMessage('Please enter a valid agent token', true);
    }
});

// --- Handle Initial Agent Token Request ---
window.electronAPI.onRequestAgentToken(() => {
    logMessage('Please enter your agent token to start monitoring');
});

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    await updateDirectoriesList();
    await loadSavedToken();
});