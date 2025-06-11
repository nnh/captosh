// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { GlobalState, GlobalStateKey } from "./store";
import { contextBridge, ipcRenderer, IpcRendererEvent, type WebviewTag } from "electron";
import type { ElectronAppPathName } from "./type";

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url: string) => ipcRenderer.send('navigate-to', url),
  onNavigate: (cb: (url: string) => void) => ipcRenderer.on('do-navigate', (_e: IpcRendererEvent, url: string) => cb(url)),
  onError: (cb: (msg: string) => void) => ipcRenderer.on('alert', (_e: IpcRendererEvent, msg: string) => cb(msg)),
  selectDirectory: () => ipcRenderer.invoke('select-output-directory'),
  getAppPath: (appPath: ElectronAppPathName) => ipcRenderer.invoke('get-app-path', appPath),
  printPDF: (webContentsId: number, outputPath: string, url: string) => ipcRenderer.invoke('print-pdf', { webContentsId, outputPath, url })
});

contextBridge.exposeInMainWorld('storeAPI', {
  get<K extends GlobalStateKey>(key: K): Promise<GlobalState[K]> {
    return ipcRenderer.invoke('get-state', key);
  },
  set<K extends GlobalStateKey>(key: K, value: GlobalState[K]) {
    ipcRenderer.send('set-state', key, value);
  },
});
