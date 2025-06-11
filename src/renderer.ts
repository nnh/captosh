/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import type { WebviewTag } from 'electron'
import './index.css';
import { format } from 'date-fns';
import { parse } from 'papaparse';

const urlInput = document.getElementById('url-input') as HTMLInputElement;
const urlButton = document.getElementById('go') as HTMLButtonElement;
const webView = document.getElementById('ptosh-webview') as WebviewTag;
const printDateTimeCheckbox = document.getElementById('print-date-time') as HTMLInputElement;
const printURLCheckbox = document.getElementById('print-url') as HTMLInputElement;
const selectDirectoryInput = document.getElementById('output-dir-input') as HTMLInputElement;
const selectDirectoryButton = document.getElementById('select-output-dir') as HTMLButtonElement;
const printButton = document.getElementById('print') as HTMLButtonElement;
const showBulkPrintButton = document.getElementById('show-bulk-print') as HTMLButtonElement;
const bulkPrintPanel = document.getElementById('bulk-print-panel') as HTMLDivElement;
const bulkPrintButton = document.getElementById('bulk-print') as HTMLButtonElement;
const bulkPrintInput = document.getElementById('bulk-input') as HTMLInputElement;
const bulkPrintStatus = document.getElementById('bulk-print-status') as HTMLDivElement;
const bulkPrintProgress = document.getElementById('bulk-print-progress') as HTMLProgressElement;

window.electronAPI.onNavigate(async (url: string) => {
  await webView.loadURL(url);
});

window.electronAPI.onError((msg: string) => {
  alert(msg);
});

window.addEventListener('DOMContentLoaded', async () => {
  const dir = await window.electronAPI.getAppPath('home');
  window.storeAPI.set('outputDirectory', dir ?? '');
  selectDirectoryInput.value = dir;
});

urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    window.electronAPI.navigate(urlInput.value);
  }
});

urlButton.addEventListener('click', () => {
  window.electronAPI.navigate(urlInput.value);
});

webView.addEventListener('did-finish-load', () => {
  urlInput.value = webView.getURL();
});

printDateTimeCheckbox.addEventListener('change', (event) => {
  const checked = (event.target as HTMLInputElement).checked;
  window.storeAPI.set('isPrintingDateTime', checked);
});

printURLCheckbox.addEventListener('change', (event) => {
  const checked = (event.target as HTMLInputElement).checked;
  console.log('printURLCheckbox', checked);
  window.storeAPI.set('isPrintingURL', checked);
});

selectDirectoryButton.addEventListener('click', async () => {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) {
    window.storeAPI.set('outputDirectory', dir);
    selectDirectoryInput.value = dir;
  }
});

printButton.addEventListener('click', async () => {
  const webContentsId = webView.getWebContentsId?.();
  const src = webView.getURL();
  const now = format(new Date(), 'yyyyMMdd_HHmmssSSS');
  const trialName = src.split('/')[4];
  const sheetName = src.split('/')[8];
  let result: string | null = null;
  if (!trialName || !sheetName) {
    result = await window.electronAPI.printPDF(webContentsId, `${now}.pdf`, src);
  } else {
    result = await window.electronAPI.printPDF(webContentsId, `${trialName}/${sheetName}/${now}.pdf`, src);
  }
  if (!result) {
    alert('印刷に失敗しました。');
    return;
  }
  alert('印刷が完了しました。');
});

showBulkPrintButton.addEventListener('click', async () => {
  bulkPrintPanel.style.display = bulkPrintPanel.style.display === 'none' ? 'block' : 'none';
});

bulkPrintButton.addEventListener('click', async () => {
  const csv = parse<string[]>(bulkPrintInput.value, { header: false, skipEmptyLines: true });
  if (!csv.data || csv.data.length === 0 || csv.errors.length > 0) {
    alert(`CSVの内容が正しくありません。${csv.errors.map(e => e.message).join(', ')}`);
    return;
  }

  const webContentsId = webView.getWebContentsId?.();
  try {
    bulkPrintButton.disabled = true;
    bulkPrintProgress.max = csv.data.length;
    bulkPrintStatus.style.display = 'block';
    let progress = 0;

    for (const [url, path] of csv.data) {
      const webViewUrl = new URL(webView.getURL());
      const baseUrl = new URL(`${webViewUrl.protocol}//${webViewUrl.host}`);
      const fullUrl = new URL(url, baseUrl);
      const result = await window.electronAPI.printPDF(webContentsId, path, fullUrl.toString());
      progress++;
      bulkPrintProgress.value = progress;
      if (!result) {
        alert(`印刷に失敗しました: ${fullUrl.toString()}`);
        return;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    alert('印刷が完了しました。');
  }
  finally {
    bulkPrintButton.disabled = false;
    bulkPrintStatus.style.display = 'none';
    bulkPrintProgress.value = 0;
  }
});
