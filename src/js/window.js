'use strict';

import fs from 'fs-extra';
import moment from 'moment-timezone';

import Url from 'url';

import { ipcRenderer, remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import TabGroup from 'electron-tabs';

import BookmarkEvent from './js/bookmark_event';
import CaptureView from './js/capture_view';
const captureView = new CaptureView();

let tabGroup = null;
let shiftKey = false
let cmdOrCtrlKey = false;

window.addEventListener('load', () => {
  tabGroup = new TabGroup();
  createTab();

  document.getElementById('add-tab-button').addEventListener('click', () => {
    createTab();
  });

  const submitButton = document.getElementById('submit-button');
  const urlBar = document.getElementById('url-bar');

  submitButton.addEventListener('click', () => {
    tabGroup.getActiveTab().webview.setAttribute('src', urlBar.value);
  });

  urlBar.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      submitButton.click();
    }
  });

  document.getElementById('back-button').addEventListener('click', () => {
    const webview = tabGroup.getActiveTab().webview;
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });

  document.getElementById('next-button').addEventListener('click', () => {
    const webview = tabGroup.getActiveTab().webview;
    if (webview.canGoForward()) {
      webview.goForward();
    }
  });

  document.getElementById('reload-button').addEventListener('click', () => {
    tabGroup.getActiveTab().webview.reload();
  });

  document.getElementById('photo-button').addEventListener('click', async () => {
    try {
      await savePDF();
    } catch (error) {
      showDialog(error.message);
    }
  });

  document.getElementById('folder-text').value = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];

  document.getElementById('folder-button').addEventListener('click', () => {
    selectFolder();
  });

  const captureContainer = document.getElementById('capture-container');
  const captureText = document.getElementById('capture-text');

  document.getElementById('prepare-button').addEventListener('click', () => {
    if (captureContainer.style['display'] === 'none') {
      captureContainer.style['display'] = 'block';
    } else {
      captureContainer.style['display'] = 'none';
      captureText.value = '';
      captureView.resetView();
    }
  });

  document.getElementById('capture-button').addEventListener('click', () => {
    if (captureText.value.length > 0) {
      captureView.resetView();
      captureFromUrls(captureText.value.split('\n'));
    }
  });

  new BookmarkEvent({
    select: document.getElementById('bookmark-select'),
    moveButton: document.getElementById('bookmark-move-button'),
    deleteButton: document.getElementById('bookmark-delete-button'),
    addButton: document.getElementById('bookmark-add-button'),
    getActiveTab: tabGroup.getActiveTab.bind(tabGroup),
    showDialog: showDialog
  });

  captureView.setView({
    captureProgress: document.getElementById('capture-progress'),
    captureResult: document.getElementById('capture-result'),
    progressBar: document.getElementById('progress-bar')
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

function createTab(url = 'https://builder.ptosh.com', active = true) {
  const urlBar = document.getElementById('url-bar');

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

function savePDF(webview = tabGroup.getActiveTab().webview, fileName) {
  const today = new Date();

  if (document.getElementById('show-url').checked) {
    webview.send('insert-url', webview.src);
  }
  if (document.getElementById('show-datetime').checked) {
    webview.send('insert-datetime', moment(today).tz('Asia/Tokyo').format());
  }

  const path = getSavePDFPath(webview.src, today, fileName);

  return new Promise((resolve, reject) => {
    webview.printToPDF(
      {
        printBackground: true
      },
      (error, data) => {
        if (error !== null) {
          reject(error);
        }

        fs.ensureFileSync(path);
        fs.writeFile(path, data, (error) => {
          webview.send('remove-inserted-element');
          if (error === null) {
            resolve();
          } else {
            reject(error);
          }
        });
      }
    );
  });
}

function getSavePDFPath(src, today, fileName) {
  const saveDirectory = document.getElementById('folder-text').value;
  if (fileName) {
    return `${saveDirectory}/${fileName}`;
  }

  const trialName = src.split('/')[4];
  const sheetName = src.split('/')[8];
  const datetime = moment(today).tz('Asia/Tokyo').format('YYYYMMDD_HHmmss');
  return `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${datetime}.pdf`;
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
      document.getElementById('folder-text').value = directories[0];
    }
  });
}

async function captureFromUrls(urls) {
  urls = urls.filter(v => v);
  captureView.initializeView(urls.length);

  const sleep = (msec) => {
    return new Promise((resolve, reject) => { setTimeout(resolve, msec); });
  }

  for (let i = 0; i < urls.length; i++) {
    // ファイル名に秒を使っているので、上書きしないために最低１秒空けている。
    await sleep(1000);
    const url = urls[i];

    let targetUrl = url;
    let targetFileName = null;
    if (url.includes(',')) {
      targetUrl = url.split(',')[0];
      targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
    }

    const result = await savePDFWithAttr(targetUrl, targetFileName);
    captureView.updateView(i + 1, result.errorText);
  };

  captureView.finish();
}

function savePDFWithAttr(targetUrl, targetFileName) {
  return new Promise((resolve, reject) => {
    const tab = tabGroup.addTab({
      title: 'blank',
      src: targetUrl,
      visible: true,
      webviewAttributes: { partition: 'persist:ptosh' }
    });
    tab.webview.preload = './js/webview.js';
    tab.webview.addEventListener('did-stop-loading', async () => {
      try {
        resolve(await savePDF(tab.webview, targetFileName));
      } catch (error) {
        resolve({ errorText: `${targetUrl}の保存に失敗しました。(${error.message})\n` });
      } finally {
        tab.close();
      }
    });
  });
}

ipcRenderer.on('exec-api', (e, arg) => {
  request(arg);
});

async function request(url) {
  const captureContainer = document.getElementById('capture-container');
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
