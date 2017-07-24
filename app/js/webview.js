'use strict';

const ipc = require('electron').ipcRenderer;

ipc.on('insert-datetime', (event, arg) => {
  let div = document.createElement('div');
  div.id = 'screenshot-datetime';
  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px'
  div.innerText = arg;
  document.getElementById('cover').insertBefore(div, document.getElementById('cover').firstChild);

  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
  $('*[style*="display: none"]').css({'cssText': 'display: none !important;'});
});

ipc.on('remove-datetime', (event, arg) => {
  let div = document.getElementById('screenshot-datetime');
  document.getElementById('cover').removeChild(div);

  // 付与したimportantを元に戻す
  $('*[style*="display: none"]').css('display','none')
})
