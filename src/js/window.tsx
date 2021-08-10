'use strict';

import { ipcRenderer } from 'electron';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, Store, Middleware } from 'redux'
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk'
import rootReducer from './reducers';
import { MainReducerType, initialMainReducer } from './reducers/main_reducers';
import MainView from './components/main_view';
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
  const folderText = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"] ?? initialMainReducer.folderText;
  const mainReducer: MainReducerType = {...initialMainReducer, urlBar: defaultUrl, folderText };
  const initialState = { mainReducer };
  store = createStore(rootReducer, initialState, applyMiddleware(...middlewares));

  ReactDOM.render(
    <Provider store={store}>
      <MainView defaultUrl={defaultUrl} />
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

ipcRenderer.on('exec-api', (_e, arg) => {
  store.dispatch(captureRequest(arg));
});
