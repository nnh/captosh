'use strict';

const ipc = require('electron').ipcRenderer;

ipc.on('insert-datetime', (event, arg) => {
  let div = document.createElement('div');
  div.id = 'screenshot-datetime';
  div.style.cssText = 'text-align:right; width:100%; background:white'
  div.innerText = arg;
  document.getElementById('cover').insertBefore(div, document.getElementById('cover').firstChild);
});

ipc.on('remove-datetime', (event, arg) => {
  let div = document.getElementById('screenshot-datetime');
  document.getElementById('cover').removeChild(div);
})
