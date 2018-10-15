'use strict';

const ipc = require('electron').ipcRenderer;

ipc.on('insert-datetime', (event, arg) => {
  insertElement('screenshot-datetime', arg);
});

ipc.on('insert-url', (event, arg) => {
  insertElement('screenshot-url', arg);
});

ipc.on('remove-inserted-element', (event, arg) => {
  if (document.getElementById('screenshot-datetime')) document.getElementById('screenshot-datetime').remove();
  if (document.getElementById('screenshot-url')) document.getElementById('screenshot-url').remove();

  // 付与したimportantを元に戻す
  $('*[style*="display: none"]').css('display', 'none');
})

function insertElement(id, arg) {
  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px';
  div.innerText = arg;

  const parent = document.getElementById('cover') ? document.getElementById('cover') : document.body;
  parent.insertBefore(div, parent.firstChild);

  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
  $('*[style*="display: none"]').css({ 'cssText': 'display: none !important;' });
}
