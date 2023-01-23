import { connect } from 'react-redux';
import { inputUrlBar, togglePrintDatetime, togglePrintUrl, changeFolder, toggleContainer, setWebviewStatus, captureRequest } from '../actions/main_actions';
import { newTask, clearView } from '../actions';
import { Dispatch } from 'redux';

type MainState = {
  mainReducer: {
    urlBar: string,
    printDatetime: boolean,
    printUrl: boolean,
    folderText: string,
    showContainer: boolean,
    src: string,
    title: string,
    ptoshUrl?: string,
    shift: unknown,
    cmdOrCtrl: unknown
  }
}

const mapStateToProps = (state: MainState) => ({
  urlBar: state.mainReducer.urlBar,
  printDatetime: state.mainReducer.printDatetime,
  printUrl: state.mainReducer.printUrl,
  folderText: state.mainReducer.folderText,
  showContainer: state.mainReducer.showContainer,
  src: state.mainReducer.src,
  title: state.mainReducer.title,
  ptoshUrl: state.mainReducer.ptoshUrl,
  shift: state.mainReducer.shift,
  cmdOrCtrl: state.mainReducer.cmdOrCtrl
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  inputUrl: (url: string) => { dispatch(inputUrlBar(url)) },
  togglePrintDatetime: () => { dispatch(togglePrintDatetime()) },
  togglePrintUrl: () => { dispatch(togglePrintUrl()) },
  changeFolder: (path: string) => { dispatch(changeFolder(path)) },
  toggleContainer: () => { dispatch(toggleContainer()) },
  setWebviewStatus: (src: string, title: string) => { dispatch(setWebviewStatus(src, title)) },
  addTask: (tasks: Task[]) => { dispatch(newTask(Date.now(), tasks)) },
  clearView: () => { dispatch(clearView()) },
  clearPtoshUrl: () => { dispatch(captureRequest('')) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
