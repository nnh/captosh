// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

declare global {
  export type Task = {
    url: string,
    path?: string
  };

  type CaptureRequestCallback = (event: Electron.IpcRendererEvent, ptoshUrl: string) => void;

  type ElectronAPI = {
    selectFolder: () => Promise<string | undefined>,
    showDialog: (message: string) => Promise<void>,
    writeFile: (path: string, data: Uint8Array) => Promise<void>,
    captureCaptoshLink: (captoshUrl: string, protocol: 'http:' | 'https:') => Promise<Task[]>,
    handleCaptureRequest: (callback: CaptureRequestCallback) => void,
  };

  var electronAPI: ElectronAPI;
}

const api: ElectronAPI = {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  showDialog: (message: string) => ipcRenderer.invoke('show-dialog', message),
  writeFile: (path: string, data: Uint8Array) => ipcRenderer.invoke('write-file', path, data),
  captureCaptoshLink: (captoshUrl: string, protocol: 'http:' | 'https:') => ipcRenderer.invoke('capture-captosh-link', captoshUrl, protocol),
  handleCaptureRequest: (callback: CaptureRequestCallback) => ipcRenderer.on('capture-request', callback),
};

contextBridge.exposeInMainWorld('electronAPI', api);

export {electronAPI};
