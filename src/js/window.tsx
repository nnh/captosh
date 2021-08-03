'use strict';

import { ipcRenderer } from 'electron';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, Store, Middleware } from 'redux'
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk'
import rootReducer from './reducers';
import MainContainer from './containers/main_container';
import { captureRequest, changeShiftKey, changeCmdOrCtrlKey } from './actions/main_actions';

const defaultUrl = 'https://builder.ptosh.com';

let store: Store; // TODO: parameter type
const middlewares: Middleware[] = [thunk];

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger({
    diff: true,
    collapsed: true,
  });
  middlewares.push(logger);
}

window.addEventListener('load', () => {
  const folderText = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
  const initialState = { mainReducer: { urlBar: defaultUrl, folderText: folderText, printDatetime: true, printUrl: false } };
  store = createStore(rootReducer, initialState, applyMiddleware(...middlewares));

  ReactDOM.render(
    <Provider store={store}>
      <MainContainer defaultUrl={defaultUrl} />
    </Provider>,
    document.getElementById('main-view')
  );
});

window.addEventListener('keydown', (e) => {
  if (e.shiftKey) store.dispatch(changeShiftKey(true));
  if (e.ctrlKey || e.metaKey) store.dispatch(changeCmdOrCtrlKey(true));
});

window.addEventListener('keyup', (e) => {
  if (!e.shiftKey) store.dispatch(changeShiftKey(false));
  if (!e.ctrlKey && !e.metaKey) store.dispatch(changeCmdOrCtrlKey(false));
});

ipcRenderer.on('exec-api', (e, arg) => {
  store.dispatch(captureRequest(arg));
});
