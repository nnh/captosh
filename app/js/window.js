'use strict';

const fs = require('fs-extra');

const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;

const TabGroup = require('electron-tabs');

let tabGroup = null;
let addTabbutton = null;
let urlBar = null;
let backButton = null;
let nextButton = null;
let reloadButton = null;
let submitButton = null;
let photoButton = null;
let folderButton = null;
let folderText = null;
let saveDirectory = null;

window.addEventListener('load', () => {
  tabGroup = new TabGroup();
  createTab();

  saveDirectory = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

  addTabbutton = document.getElementById('add-tab-button');
  urlBar = document.getElementById('url-bar');
  backButton = document.getElementById('back-button');
  nextButton = document.getElementById('next-button');
  reloadButton = document.getElementById('reload-button');
  submitButton = document.getElementById('submit-button');
  photoButton = document.getElementById('photo-button');
  folderButton = document.getElementById('folder-button');
  folderText = document.getElementById('folder-text');
  folderText.innerText = saveDirectory;

  addTabbutton.addEventListener('click', () => {
    createTab();
  });
  urlBar.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      submitButton.click();
    }
  });
  backButton.addEventListener('click', () => {
    let webview = tabGroup.getActiveTab().webview;
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });
  nextButton.addEventListener('click', () => {
    let webview = tabGroup.getActiveTab().webview;
    if (webview.canGoForward()) {
      webview.goForward();
    }
  });
  reloadButton.addEventListener('click', () => {
    tabGroup.getActiveTab().webview.reload();
  });
  submitButton.addEventListener('click', () => {
    tabGroup.getActiveTab().webview.setAttribute('src', urlBar.value);
  });
  photoButton.addEventListener('click', () => {
    savePDF();
  });
  folderButton.addEventListener('click', () => {
    selectFolder();
  })
});

function createTab(url = 'https://test-ptosh.herokuapp.com') {
  let tab = tabGroup.addTab({
    title: 'blank',
    src: url,
    visible: true,
    active: true
  });
  tab.webview.preload = './js/webview.js';
  tab.webview.addEventListener('did-stop-loading', () => {
    urlBar.value = tab.webview.src;
    tab.setTitle(tab.webview.getTitle());
    // tab.webview.openDevTools();
  });
  tab.webview.addEventListener('new-window', (e) => {
    createTab(e.url);
  });
}

function savePDF() {
  let webview = tabGroup.getActiveTab().webview;

  let today = new Date();

  let offset = today.getTimezoneOffset() / -60;
  let offsetStr = `${(0 <= offset) ? '+' : '-'}${zeroPadding(Math.abs(offset))}:00`;
  let isoDate = `${today.getFullYear()}-${zeroPadding(today.getMonth()+1)}-${zeroPadding(today.getDate())}`;
  let isoDatetime = `${isoDate}T${today.toLocaleTimeString()}${offsetStr}`;
  webview.send('insert-datetime', isoDatetime);

  let date = `${today.getFullYear()}${zeroPadding(today.getMonth()+1)}${zeroPadding(today.getDate())}`;
  let time = `${zeroPadding(today.getHours())}${zeroPadding(today.getMinutes())}${zeroPadding(today.getSeconds())}`
  let trialName = webview.src.split('/')[4];
  let sheetName = webview.src.split('/')[8];
  let path = `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${date}_${time}.pdf`;

  webview.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error !== null) {
        showDialog(error.toString, 'error');
      }

      fs.ensureFileSync(path);
      fs.writeFile(path, data, (error) => {
        webview.send('remove-datetime');
        if (error === null) {
          showDialog(`保存しました。\n${path}`, 'info');
        } else {
          showDialog(error.toString, 'error');
        }
      });
    }
  );
}

function showDialog(message, type) {
  let win = BrowserWindow.getFocusedWindow();
  let options = {
    type: type,
    buttons: ['OK'],
    title: type,
    message: type,
    detail: message
  };
  dialog.showMessageBox(win, options);
}

function zeroPadding(num) {
  return ('0' + num).slice(-2);
}

function selectFolder() {
  let win = BrowserWindow.getFocusedWindow();
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }, (directories) => {
    saveDirectory = directories[0];
    folderText.innerText = saveDirectory;
  });
}
