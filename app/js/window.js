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
let prepareButton = null;
let captureContainer = null;
let captureText = null;
let captureButton = null;
let captureResult = null;

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
  prepareButton = document.getElementById('prepare-button');
  captureContainer = document.getElementById('capture-container');
  captureText = document.getElementById('capture-text');
  captureButton = document.getElementById('capture-button');
  captureResult = document.getElementById('capture-result');

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
  });
  prepareButton.addEventListener('click', () => {
     if (captureContainer.style['display'] == 'none') {
       captureContainer.style['display'] = 'block';
     } else {
       captureContainer.style['display'] = 'none';
       captureText.value = '';
       captureResult.innerHTML = '';
     }
  });
  captureButton.addEventListener('click', () => {
    if (captureText.value.length > 0) captureFromUrls(captureText.value.split('\n'));
  });
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

function savePDF(webview = tabGroup.getActiveTab().webview, isShowDialog = true, callback = null) {
  let today = new Date();

  let offset = today.getTimezoneOffset() / -60;
  let offsetStr = `${(0 <= offset) ? '+' : '-'}${zeroPadding(Math.abs(offset))}:00`;
  let isoDate = `${today.getFullYear()}-${zeroPadding(today.getMonth()+1)}-${zeroPadding(today.getDate())}`;
  let isoDatetime = `${isoDate}T${today.toLocaleTimeString()}${offsetStr}`;
  webview.send('insert-datetime', isoDatetime);

  let date = `${today.getFullYear()}${zeroPadding(today.getMonth()+1)}${zeroPadding(today.getDate())}`;
  let time = `${zeroPadding(today.getHours())}${zeroPadding(today.getMinutes())}${zeroPadding(today.getSeconds())}`;
  let trialName = webview.src.split('/')[4];
  let sheetName = webview.src.split('/')[8];
  let path = `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${date}_${time}.pdf`;

  if (document.getElementById('show-url').checked) {
    webview.send('insert-url', document.getElementById('url-bar').value);
  }

  webview.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error !== null) {
        if (isShowDialog) showDialog(error.toString(), 'error');
        if (typeof callback === 'function') callback(error.toString());
        return;
      }

      fs.ensureFileSync(path);
      fs.writeFile(path, data, (error) => {
        webview.send('remove-inserted-element');
        if (error === null) {
          if (isShowDialog) showDialog(`保存しました。\n${path}`, 'info');
          if (typeof callback === 'function') callback(path);
        } else {
          if (isShowDialog) showDialog(error.toString(), 'error');
          if (typeof callback === 'function') callback(error.toString());
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

function captureFromUrls(urls) {
  let result = [];
  let promices = (urls) => {
    return Promise.all(urls.map((url) => {
      return doPromise(url);
    }));
  };
  let doPromise = (url) => {
    return new Promise((resolve, reject) => {
      let tab = tabGroup.addTab({
        title: 'blank',
        src: url,
        visible: true
      });
      tab.webview.addEventListener('did-stop-loading', () => {
        savePDF(tab.webview, false, (res) => {
          result.push({
            url: url,
            result: res
          });
          tab.close();
          resolve();
        });
      });
    });
  }
  promices(urls).then(() => {
    let table = document.createElement('table');
    table.id = 'capture-result-table'
    let tbody = document.createElement('tbody');
    for (let i = 0; i < result.length; i++) {
      let res = result[i];
      let row = document.createElement('tr');
      for (let key in res) {
        let cell = document.createElement('td');
        cell.innerText = res[key];
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    captureResult.appendChild(table);
  });
}
