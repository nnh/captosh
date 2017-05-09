'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const dirname = require('path').dirname;

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

window.addEventListener('load', () => {
  tabGroup = new TabGroup();
  createTab();

  addTabbutton = document.getElementById('add-tab-button');
  urlBar = document.getElementById('url-bar');
  backButton = document.getElementById('back-button');
  nextButton = document.getElementById('next-button');
  reloadButton = document.getElementById('reload-button');
  submitButton = document.getElementById('submit-button');
  photoButton = document.getElementById('photo-button');

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
});

function createTab(url = 'https://test-ptosh.herokuapp.com') {
  let tab = tabGroup.addTab({
    title: 'blank',
    src: url,
    visible: true,
    active: true
  });
  tab.webview.addEventListener('did-stop-loading', () => {
    urlBar.value = tab.webview.src;
    tab.setTitle(tab.webview.getTitle());
    // webview.openDevTools();
  });
}

function savePDF() {
  let webview = tabGroup.getActiveTab().webview;

  let today = new Date();
  let date = `${today.getFullYear()}${zeroPadding(today.getMonth()+1)}${zeroPadding(today.getDate())}`;
  let time = `${zeroPadding(today.getHours())}${zeroPadding(today.getMinutes())}${zeroPadding(today.getSeconds())}`
  let trialName = webview.src.split('/')[4];
  let sheetName = webview.src.split('/')[8];
  let userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
  let path = `${userHome}/ptosh_crf_image/${trialName}/${sheetName}/${date}_${time}.pdf`;

  webview.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error !== null) {
        showDialog(error.toString, 'error');
      }

      mkdirp(dirname(path), (error) => {
        if (error !== null) {
          showDialog(error.toString, 'error');
        }

        fs.writeFile(path, data, (error) => {
          if (error === null) {
            showDialog(`保存しました。\n${path}`, 'info');
          } else {
            showDialog(error.toString, 'error');
          }
        });
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
  return ("0" + num).slice(-2);
}
