import { GlobalState, GlobalStateKey, GlobalStateValue } from "./store";
import type { ElectronAppPathName } from "./type";
export {}

declare global {
  interface Window {
    electronAPI: {
      onNavigate: (callback: (url: string) => void) => void;
      onError:   (callback: (msg: string) => void) => void;
      navigate: (url: string) => void;
      selectDirectory: () => Promise<string | null>;
      getAppPath: (name: ElectronAppPathName) => Promise<string>;
      printPDF: (webContentsId: number, outputPath: string, url?: string) => Promise<string | null>;
    },
    storeAPI: {
      get: <K extends GlobalStateKey>(key: K) => Promise<GlobalState[K]>;
      set: <K extends GlobalStateKey>(key: K, value: GlobalState[K]) => void;
    },
  }
}
