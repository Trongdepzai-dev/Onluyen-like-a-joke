const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    websiteSelected: (website) => ipcRenderer.send('prochat-website-selected', website),
    closePrompt: () => ipcRenderer.send('prochat-prompt-close'),
});
