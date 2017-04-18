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
      let date = new Date();
      let datetime = `${date.getFullYear()}${("0"+(date.getMonth()+1)).slice(-2)}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
      let trialName = document.location.href.split('/')[4];
      let userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
      let path = `${userHome}/ptosh_crf_image/${trialName}/initial/${datetime}.png`;

      let data = canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, "");
      let buffer = new Buffer(data, 'base64');
      mkdirp(dirname(path), (error) => {
        if (error !== null) {
          showDialog(error.toString, 'error');
        }
        fs.writeFile(path, buffer, (error) => {
          if (error === null) {
            showDialog(`保存しました。${path}`, 'info');
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
      title: 'Error',
      message: type,
      detail: message
    };
    dialog.showMessageBox(win, options);
  }
})
