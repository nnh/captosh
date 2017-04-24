'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const dirname = require('path').dirname;

const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;

let webview = null;
let url_bar = null;

let back_button = null;
let next_button = null;
let reload_button = null;
let submit_button = null;
let photo_button = null;

window.addEventListener('load', () => {
  webview = document.getElementById('webview');
  url_bar = document.getElementById('url-bar');

  back_button = document.getElementById('back-button');
  next_button = document.getElementById('next-button');
  reload_button = document.getElementById('reload-button');
  submit_button = document.getElementById('submit-button');
  photo_button = document.getElementById('photo-button');

  webview.addEventListener('did-stop-loading', () => {
    url_bar.value = webview.src;
    // webview.openDevTools();
  });
  url_bar.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
      submit_button.click();
    }
  });

  back_button.addEventListener('click', () => {
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });
  next_button.addEventListener('click', () => {
    if (webview.canGoForward()) {
      webview.goForward();
    }
  });
  reload_button.addEventListener('click', () => {
    webview.reload();
  });
  submit_button.addEventListener('click', () => {
    webview.setAttribute('src', url_bar.value);
  });
  photo_button.addEventListener('click', () => {
    savePDF();
    // webview.send('take-screenshot');
  });
});

function savePDF() {
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
