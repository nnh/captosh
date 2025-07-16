// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { GlobalState, GlobalStateKey } from "./store";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import type { ElectronAppPathName } from "./type";

/**
 * `electronAPI`は、メインプロセスとの基本的なやり取りを担うAPIです。
 * ファイル操作、ナビゲーション、通知などが含まれます。
 */
contextBridge.exposeInMainWorld('electronAPI', {

  /**
   * 指定されたURLにWebViewをナビゲートします。
   * @param url - ナビゲート先のURL。
   */
  navigate: (url: string) => ipcRenderer.send('navigate-to', url),

  /**
   * WebViewのナビゲーションイベントをリッスンします。
   * @param cb - ナビゲーション時に実行されるコールバック関数。URLを引数に取ります。
   */
  onNavigate: (cb: (url: string) => void) => ipcRenderer.on('do-navigate', (_e: IpcRendererEvent, url: string) => cb(url)),

  /**
   * エラーイベントをリッスンします。
   * @param cb - エラー発生時に実行されるコールバック関数。エラーメッセージを引数に取ります。
   */
  onError: (cb: (msg: string) => void) => ipcRenderer.on('alert', (_e: IpcRendererEvent, msg: string) => cb(msg)),

  /**
   * ディレクトリ選択ダイアログを開きます。
   * @returns 選択されたディレクトリのパス。キャンセルされた場合はnull。
   */
  selectDirectory: () => ipcRenderer.invoke('select-output-directory'),

  /**
   * Electronの特別なパス（例：'home', 'documents'）を取得します。
   * @param appPath - 取得したいパスの名前。
   * @returns 指定されたパスの文字列。
   */
  getAppPath: (appPath: ElectronAppPathName) => ipcRenderer.invoke('get-app-path', appPath),

  /**
   * 指定されたWebコンテンツをPDFとして印刷（保存）します。
   * @param webContentsId - 対象のWebコンテンツのID。
   * @param outputPath - PDFの保存先パス。
   * @param url - 印刷対象のURL。
   * @returns 保存されたPDFのフルパス。
   */
  printPDF: (webContentsId: number, outputPath: string, url: string) => ipcRenderer.invoke('print-pdf', { webContentsId, outputPath, url }),
});

/**
 * `storeAPI`は、メインプロセスで管理されている状態(ストア)とのやり取りを担うAPIです。
 * アプリケーション全体の設定や状態を取得・設定します。
 */
contextBridge.exposeInMainWorld('storeAPI', {
  /**
   * ストアから指定されたキーの値を取得します。
   * @param key - 取得したい値のキー。
   * @returns 指定されたキーに対応する値。
   */
  get<K extends GlobalStateKey>(key: K): Promise<GlobalState[K]> {
    return ipcRenderer.invoke('get-state', key);
  },
  /**
   * ストアに指定されたキーで値を設定します。
   * @param key - 設定したい値のキー。
   * @param value - 設定する値。
   */
  set<K extends GlobalStateKey>(key: K, value: GlobalState[K]) {
    ipcRenderer.send('set-state', key, value);
  },
});
