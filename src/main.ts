import { app, BrowserWindow, ipcMain, dialog, webContents } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { TZDate } from '@date-fns/tz';
import { GlobalState, store } from './store';
import { promises as fs } from 'fs'
import type { ElectronAppPathName } from "./type";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('navigate-to', (event, url) => {
  if (/^https?:\/\//.test(url)) {
    event.sender.send('do-navigate', url)
  } else {
    event.sender.send('alert', `Invalid URL: ${url}`);
  }
})

ipcMain.handle('get-state', (_e, key: keyof GlobalState) => {
  return store.get(key);
});

ipcMain.on('set-state', (_e, key: keyof GlobalState, value: GlobalState[keyof GlobalState]) => {
  store.set(key, value);
});

ipcMain.handle('get-app-path', (_e, name: ElectronAppPathName) => {
  return app.getPath(name);
})

ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: '出力先フォルダを選択',
    defaultPath: app.getPath('documents'),
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

async function insertElement(window: BrowserWindow, id: string, content: string) {
  await window.webContents.executeJavaScript(`
    (() => {
      let element = document.createElement('div');
      element.id = '${id}';
      element.innerText = \`${content}\`;
      Object.assign(element.style, {
        'text-align': 'right',
        width: '100%',
        backgroundColor: 'white' ,
      })
      let parent = document.getElementById('cover') ?? document.body;
      parent.insertBefore(element, parent.firstChild);
      // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
      document.querySelectorAll('*[style*="display: none"]').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    })();
  `);
}

ipcMain.handle('print-pdf', async (e, { webContentsId, url, outputPath }: { webContentsId: number, url: string, outputPath: string }) => {
  const outputFullPath = path.join(store.get('outputDirectory'), 'ptosh_crf_image', outputPath);
  const webContent = webContents.fromId(webContentsId);

  if (!webContent) {
    throw new Error(`No webContents for id ${webContentsId}`)
  }

  const offscreen = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      session: webContent.session,
    }
  });

  await offscreen.loadURL(url);

  if (store.get('isPrintingDateTime')) {
    const dateTime = new TZDate().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await insertElement(offscreen, 'captosh-date-time', dateTime);
  }

  if (store.get('isPrintingURL')) {
    await insertElement(offscreen, 'captosh-url', url);
  }

  const buffer = await offscreen.webContents.printToPDF({ printBackground: true });
  await fs.mkdir(path.dirname(outputFullPath), { recursive: true });
  await fs.writeFile(outputFullPath, buffer);
  offscreen.destroy();
  return outputFullPath;
});
