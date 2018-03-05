'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

var mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });
  mainWindow.loadURL(`file://${__dirname}/window.html`);
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });;

  let template = [{
    label: 'Application',
    submenu: [
      { label: '終了', accelerator: 'Command+Q', click: () => { app.quit(); } }
    ]
  }, {
    label: '編集',
    submenu: [
      { label: '取り消す', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'やり直す', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: '切り取り', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'コピー', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: '貼り付け', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'すべてを選択', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]
  }];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', createWindow);

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
