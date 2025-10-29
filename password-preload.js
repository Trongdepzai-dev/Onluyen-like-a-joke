const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPassword: (password) => ipcRenderer.send('password-submitted', password),
    onPasswordIncorrect: (callback) => ipcRenderer.on('password-incorrect', callback)
});