const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    addDirectory: () => ipcRenderer.invoke('add-directory'),
    getMonitoredDirectories: () => ipcRenderer.invoke('get-monitored-directories'),
    removeDirectory: (dir) => ipcRenderer.invoke('remove-directory', dir),
    getSavedToken: () => ipcRenderer.invoke('get-saved-token'),
    submitAgentToken: (token) => ipcRenderer.invoke('submit-agent-token', token),
    onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, message, isError) => callback(message, isError)),
    onRequestAgentToken: (callback) => ipcRenderer.on('request-agent-token', callback),
});