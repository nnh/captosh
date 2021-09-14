import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('insertDatetime', (arg: string) => {
  insertElement('screenshot-datetime', arg);
});
contextBridge.exposeInMainWorld('insertUrl', (arg: string) => {
  insertElement('screenshot-url', arg);
});

contextBridge.exposeInMainWorld('removeInsertedElements', () => {
  const datetime = document.getElementById('screenshot-datetime')
  if (datetime) {
    datetime.remove();
  }
  const url = document.getElementById('screenshot-url')
  if (url) {
    url.remove();
  }

  // 付与したimportantを元に戻す
  document.querySelectorAll<HTMLElement>('*[style*="display: none"]').forEach((e) => e.style.setProperty('display', 'none'));
});

function insertElement(id: string, arg: string) {
  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px';
  div.innerText = arg;

  const parent = document.getElementById('cover') ?? document.body;
  parent.insertBefore(div, parent.firstChild);

  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与
  document.querySelectorAll<HTMLElement>('*[style*="display: none"]').forEach((e) => e.style.setProperty('display', 'none', 'important'));
}
