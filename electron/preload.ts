import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getToken: () => ipcRenderer.invoke('token:get'),
  setToken: (token: string) => ipcRenderer.invoke('token:set', token),
  hasToken: () => ipcRenderer.invoke('token:has'),
  clearToken: () => ipcRenderer.invoke('token:clear'),
  isElectron: true,
})
