'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const dirname = require('path').dirname;
const html2canvas = require('html2canvas');

const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;

ipc.on('take-screenshot', (event, arg) => {
  html2canvas(document.body, {
    onrendered: function(canvas) {
      let today = new Date();
      let date = `${today.getFullYear()}${zeroPadding(today.getMonth()+1)}${zeroPadding(today.getDate())}`;
      let time = `${zeroPadding(today.getHours())}${zeroPadding(today.getMinutes())}${zeroPadding(today.getSeconds())}`
      let trialName = document.location.href.split('/')[4];
      let userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
      let path = `${userHome}/ptosh_crf_image/${trialName}/initial/${date}_${time}.png`;

      let data = canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, "");
      let buffer = new Buffer(data, 'base64');
      mkdirp(dirname(path), (error) => {
        if (error !== null) {
          showDialog(error.toString, 'error');
        }

        fs.writeFile(path, buffer, (error) => {
          if (error === null) {
            showDialog(`保存しました。\n${path}`, 'info');
          } else {
            showDialog(error.toString, 'error');
          }
        });
      });
    }
  });

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
})
