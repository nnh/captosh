'use strict';

import { ipcRenderer } from 'electron';

ipcRenderer.on('insert-datetime', (event, arg) => {
  insertElement('screenshot-datetime', arg);
});

ipcRenderer.on('insert-url', (event, arg) => {
  insertElement('screenshot-url', arg);
});

ipcRenderer.on('remove-inserted-element', (event, arg) => {
  const datetime = document.getElementById('screenshot-datetime')
  if (datetime) {
    datetime.remove();
  }
  const url = document.getElementById('screenshot-url')
  if (url) {
    url.remove();
  }

  // 付与したimportantを元に戻す
  $('*[style*="display: none"]').css('display', 'none');
})

function insertElement(id: string, arg: string) {
  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px';
  div.innerText = arg;

  const parent = document.getElementById('cover') ?? document.body;
  parent.insertBefore(div, parent.firstChild);

  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
  $('*[style*="display: none"]').css({ 'cssText': 'display: none !important;' });
}
