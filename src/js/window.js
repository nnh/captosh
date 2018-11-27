'use strict';

import fs from 'fs-extra';
import moment from 'moment-timezone';

import Url from 'url';

import { ipcRenderer, remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import TabGroup from 'electron-tabs';

let tabGroup = null,
    addTabbutton = null,
    urlBar = null,
    backButton = null,
    nextButton = null,
    reloadButton = null,
    submitButton = null,
    photoButton = null,
    folderButton = null,
    folderText = null,
    saveDirectory = null,
    prepareButton = null,
    captureContainer = null,
    captureText = null,
    captureButton = null,
    captureResult = null,
    shiftKey = false,
    cmdOrCtrlKey = false;

window.addEventListener('load', () => {
  tabGroup = new TabGroup();
  createTab();

  saveDirectory = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];

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
    const webview = tabGroup.getActiveTab().webview;
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });
  nextButton.addEventListener('click', () => {
    const webview = tabGroup.getActiveTab().webview;
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
    if (captureContainer.style['display'] === 'none') {
      captureContainer.style['display'] = 'block';
    } else {
      captureContainer.style['display'] = 'none';
      captureText.value = '';
      captureResult.innerHTML = '';
    }
  });
  captureButton.addEventListener('click', () => {
    captureResult.innerHTML = '';
    if (captureText.value.length > 0) {
      captureFromUrls(captureText.value.split('\n'));
    }
  });
});

window.addEventListener('keydown', (e) => {
  shiftKey = e.shiftKey;
  cmdOrCtrlKey = e.ctrlKey || e.metaKey;
});
window.addEventListener('keyup', (e) => {
  shiftKey = e.shiftKey;
  cmdOrCtrlKey = e.ctrlKey || e.metaKey;
});

function createTab(url = 'https://test-ptosh.herokuapp.com', active = true) {
  const tab = tabGroup.addTab({
    title: 'blank',
    src: url,
    visible: true,
    active: active,
    webviewAttributes: { partition: 'persist:ptosh' }
  });
  tab.on('active', (tab) => {
    urlBar.value = tab.webview.src;
  });
  tab.webview.preload = './js/webview.js';
  tab.webview.addEventListener('did-stop-loading', () => {
    if (active) {
      urlBar.value = tab.webview.src;
    }
    tab.setTitle(tab.webview.getTitle());
    // tab.webview.openDevTools();
  });
  tab.webview.addEventListener('new-window', (e) => {
    if (shiftKey && cmdOrCtrlKey) {
      createTab(e.url, false);
    } else {
      createTab(e.url);
    }
  });
}

function savePDF(webview = tabGroup.getActiveTab().webview, isShowDialog = true, fileName, callback) {
  const today = new Date();

  if (document.getElementById('show-url').checked) {
    webview.send('insert-url', webview.src);
  }
  if (document.getElementById('show-datetime').checked) {
    webview.send('insert-datetime', moment(today).tz('Asia/Tokyo').format());
  }

  const trialName = webview.src.split('/')[4];
  const sheetName = webview.src.split('/')[8];
  const datetime = moment(today).tz('Asia/Tokyo').format('YYYYMMDD_HHmmss');
  const path = fileName ? `${saveDirectory}/${fileName}` : `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${datetime}.pdf`;

  webview.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error !== null) {
        if (isShowDialog) {
          showDialog(error.toString());
        }
        if (typeof callback === 'function') {
          callback(error.toString());
        }
        return;
      }

      fs.ensureFileSync(path);
      fs.writeFile(path, data, (error) => {
        webview.send('remove-inserted-element');
        if (error === null) {
          if (typeof callback === 'function') {
            callback(path);
          }
        } else {
          if (isShowDialog) {
            showDialog(error.toString());
          }
          if (typeof callback === 'function') {
            callback(error.toString());
          }
        }
      });
    }
  );
}

function showDialog(message) {
  const win = BrowserWindow.getFocusedWindow();
  const options = {
    type: 'error',
    buttons: ['閉じる'],
    title: 'error',
    message: 'error',
    detail: message
  };
  dialog.showMessageBox(win, options);
}

function selectFolder() {
  const win = BrowserWindow.getFocusedWindow();
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }, (directories) => {
    if (directories) {
      saveDirectory = directories[0];
      folderText.innerText = saveDirectory;
    }
  });
}

async function captureFromUrls(urls) {
  urls = urls.filter(v => v);

  const table = document.createElement('table');
  table.id = 'capture-result-table';
  const tbody = document.createElement('tbody');
  tbody.id = 'capture-result-tbody';
  table.appendChild(tbody);
  captureResult.appendChild(table);

  const sleep = (msec) => {
    return new Promise((resolve, reject) => { setTimeout(resolve, msec); });
  }

  const doPromise = (url) => {
    let targetUrl = url;
    let targetFileName = null;
    if (url.includes(',')) {
      targetUrl = url.split(',')[0];
      targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
    }
    return new Promise((resolve, reject) => {
      const tab = tabGroup.addTab({
        title: 'blank',
        src: targetUrl,
        visible: true,
        webviewAttributes: { partition: 'persist:ptosh' }
      });
      tab.webview.preload = './js/webview.js';
      tab.webview.addEventListener('did-stop-loading', () => {
        savePDF(tab.webview, false, targetFileName, (res) => {
          tab.close();
          resolve({ url: targetUrl, result: res });
        });
      });
    });
  }

  for (let i = 0; i < urls.length; i++) {
    // ファイル名に秒を使っているので、上書きしないために最低１秒空けている。
    await sleep(1000);
    const result = await doPromise(urls[i]);
    const row = document.createElement('tr');
    for (let key in result) {
      const cell = document.createElement('td');
      cell.innerText = result[key];
      row.appendChild(cell);
    }
    document.getElementById('capture-result-tbody').appendChild(row);
  }

  const div = document.createElement('div');
  div.innerText = '終了しました。'
  captureResult.insertBefore(div, captureResult.firstChild);
}

ipcRenderer.on('exec-api', (e, arg) => {
  request(arg);
});

async function request(url) {
  if (captureContainer.style['display'] === 'none') {
    captureContainer.style['display'] = 'block';
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      }
    });
    const text = await response.text();

    const targetUrl = new Url.URL(url);
    const urls = text.split(/\n/).map((value) => {
      const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;
      if (value.includes(',')) {
        return `${new Url.URL(value.split(',')[0], baseUrl).href},${value.split(',')[1]}`;
      } else {
        return new Url.URL(value, baseUrl).href;
      }
    });

    captureFromUrls(urls);
  } catch(error) {
    showDialog(error);
  }
}