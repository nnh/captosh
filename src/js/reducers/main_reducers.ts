import { MainActionType } from '../actions/main_actions'

const mainReducer = (
  state = { urlBar: '', printDatetime: true, printUrl: false, folderText: '', showContainer: false, src: '', title: '', ptoshUrl: '', shift: false, cmdOrCtrl: false },
  action
) => {
  console.log(state)
  switch (action.type) {
    case MainActionType.input:
      return { ...state, urlBar: action.urlBar };
    case MainActionType.datetime:
      return { ...state, printDatetime: !state.printDatetime };
    case MainActionType.url:
      return { ...state, printUrl: !state.printUrl };
    case MainActionType.folder:
      return { ...state, folderText: action.folderText };
    case MainActionType.show:
      return { ...state, showContainer: !state.showContainer };
    case MainActionType.webview:
      return { ...state, src: action.src, title: action.title };
    case MainActionType.request:
      return { ...state, ptoshUrl: action.ptoshUrl };
    case MainActionType.changeShift:
      return { ...state, shift: action.shift };
    case MainActionType.changeCmdOrCtrl:
      return { ...state, cmdOrCtrl: action.cmdOrCtrl };
    default:
      return state;
  }
}

export default mainReducer;
