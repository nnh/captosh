export const inputUrlBar = (urlBar: string) => ({
  type: MainActionType.input,
  urlBar
});

export const togglePrintDatetime = () => ({
  type: MainActionType.datetime
});

export const togglePrintUrl = () => ({
  type: MainActionType.url
});

export const changeFolder = (folderText: string) => ({
  type: MainActionType.folder,
  folderText
});

export const toggleContainer = () => ({
  type: MainActionType.show
});

export const setWebviewStatus = (src: string, title: string) => ({
  type: MainActionType.webview,
  src,
  title
});

export const captureRequest = (ptoshUrl: string) => ({
  type: MainActionType.request,
  ptoshUrl
});

export const changeShiftKey = (shift: boolean) => ({
  type: MainActionType.changeShift,
  shift
});

export const changeCmdOrCtrlKey = (cmdOrCtrl: boolean) => ({
  type: MainActionType.changeCmdOrCtrl,
  cmdOrCtrl
});

export const MainActionType = {
  input: 'INPUT_URLBAR',
  datetime: 'PRINT_DATETIME',
  url: 'PRINT_URL',
  folder: 'SELECT_FOLDER',
  show: 'SHOW_CONTAINER',
  webview: 'SET_WEBVIEW_STATUS',
  request: 'CAPTURE_REQUEST',
  changeShift: 'CHANGE_SHIFT_KEY',
  changeCmdOrCtrl: 'CHANGE_CMD_OR_CTRL_KEY'
}
