'use strict';

const fs = require('fs');

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

  webview.addEventListener('did-start-loading', () => {
    url_bar.value = webview.src;
  })
  webview.openDevTools();
  url_bar.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) submit_button.click();
  });

  back_button.addEventListener('click', () => {
    if (webview.canGoBack()) webview.goBack();
  });
  next_button.addEventListener('click', () => {
    if (webview.canGoForward()) webview.goForward();
  });
  reload_button.addEventListener('click', () => {
    webview.reload();
  });
  submit_button.addEventListener('click', () => {
    webview.setAttribute('src', url_bar.value);
  });
  photo_button.addEventListener('click', () => {
    webview.send('take-screenshot');
  });
});
