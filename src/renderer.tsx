/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, Store, Middleware } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import rootReducer from './js/reducers';
import { MainReducerType, initialMainReducer } from './js/reducers/main_reducers';
import MainView  from './js/components/main_view';
import { captureRequest, changeShiftKey, changeCmdOrCtrlKey } from './js/actions/main_actions';
import 'electron-tabs';

const defaultUrl = 'https://builder.ptosh.com';

let store: Store; // TODO: parameter type
const middlewares: Middleware[] = [thunk];

window.addEventListener('load', () => {
  //const folderText = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"] ?? initialMainReducer.folderText;
  const folderText = initialMainReducer.folderText;
  const mainReducer: MainReducerType = {...initialMainReducer, urlBar: defaultUrl, folderText };
  const initialState = { mainReducer };
  const store = createStore(rootReducer, initialState, applyMiddleware(...middlewares));

  ReactDOM.render(
    <Provider store={store}>
      <MainView defaultUrl={defaultUrl}/>
    </Provider>,
    document.getElementById('main-view')
  );

  window.electronAPI.handleCaptureRequest((_e, arg) => {
    store.dispatch(captureRequest(arg));
  });
});

window.addEventListener('keydown', (e) => {
  if (e.shiftKey) store.dispatch(changeShiftKey(true));
  if (e.ctrlKey || e.metaKey) store.dispatch(changeCmdOrCtrlKey(true));
});

window.addEventListener('keyup', (e) => {
  if (!e.shiftKey) store.dispatch(changeShiftKey(false));
  if (!e.ctrlKey && !e.metaKey) store.dispatch(changeCmdOrCtrlKey(false));
});
