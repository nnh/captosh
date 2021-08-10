'use strict';

import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

const customScheme = 'captosh://';
const customSchemeRegExp = new RegExp(customScheme);

let mainWindow: BrowserWindow|undefined = undefined;

const lock = app.requestSingleInstanceLock();
if (lock) {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();

      // for Windows
      commandLine.forEach(checkCustomScheme);
    }
  })

  app.on('ready', createWindow);
} else {
  app.quit();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      partition: 'persist:ptosh',
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webviewTag: true,
    }
  });
  mainWindow.loadURL(`file://${__dirname}/window.html`);
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: 'Application',
      submenu: [
        {
          label: '終了',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        {
          label: '取り消す',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'やり直す',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '切り取り',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '貼り付け',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'すべてを選択',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-finish-launching', () => {
  // for OSX
  app.on('open-url', (e, url) => {

    checkCustomScheme(url);
  });

  // for Windows
  process.argv.forEach(checkCustomScheme);
});

function checkCustomScheme(url: string) {
  if (customSchemeRegExp.test(url) && mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('exec-api', url.replace(customScheme, 'https://'));
  }
}
