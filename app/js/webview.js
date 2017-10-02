'use strict';

const ipc = require('electron').ipcRenderer;

ipc.on('insert-datetime', (event, arg) => {
  insertElement('screenshot-datetime', arg, document.getElementById('cover').firstChild);

  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
  $('*[style*="display: none"]').css({'cssText': 'display: none !important;'});
});

ipc.on('insert-url', (event, arg) => {
  insertElement('screenshot-url', arg, document.getElementById('screenshot-datetime').nextSibling);
});

ipc.on('remove-inserted-element', (event, arg) => {
  document.getElementById('cover').removeChild(document.getElementById('screenshot-datetime'));
  document.getElementById('cover').removeChild(document.getElementById('screenshot-url'));

  // 付与したimportantを元に戻す
  $('*[style*="display: none"]').css('display','none')
})

function insertElement(id, arg, target) {
  let div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px';
  div.innerText = arg;
  document.getElementById('cover').insertBefore(div, target);
}
