import { connect } from 'react-redux';
import { inputUrlBar, togglePrintDatetime, togglePrintUrl, changeFolder, toggleContainer, setWebviewStatus, captureRequest } from '../actions/main_actions';
import { newTask, clearView } from '../actions';
import MainView from '../components/main_view';

const mapStateToProps = (state) => ({
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  inputUrl: (url) => { dispatch(inputUrlBar(url)) },
  togglePrintDatetime: () => { dispatch(togglePrintDatetime()) },
  togglePrintUrl: () => { dispatch(togglePrintUrl()) },
  changeFolder: (path) => { dispatch(changeFolder(path)) },
  toggleContainer: () => { dispatch(toggleContainer()) },
  setWebviewStatus: (src, title) => { dispatch(setWebviewStatus(src, title)) },
  addTask: (urls) => { dispatch(newTask(Date.now(), urls)) },
  clearView: () => { dispatch(clearView()) },
  clearPtoshUrl: () => { dispatch(captureRequest('')) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainView);
