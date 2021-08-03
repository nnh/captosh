import { connect } from 'react-redux';
import { newTask, addProgress, startCapture, endCapture, inputUrl } from '../actions';
import CaptureView from '../components/capture_view';
import ProgressStatus from '../progress_status';

const mapStateToProps = (state) => ({
  captureTasks: state.captureTasks,
  result: state.resultText,
  capturing: state.captureState,
  urls: state.inputUrl,
  capturable: () => {
    if (state.captureState || state.captureTasks.length === 0) return false;
    return state.captureTasks.filter(task => ![ProgressStatus.stopped, ProgressStatus.done].includes(task.status)).length;
  },
  nextTask: () => {
    const t = state.captureTasks.find(task => ![ProgressStatus.stopped, ProgressStatus.done].includes(task.status));
    return t && { id: t.id, url: t.urls[t.now] };
  }
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  startCapture: () => { dispatch(startCapture()) },
  endCapture: () => { dispatch(endCapture()) },
  count: (id, result) => { dispatch(addProgress(id, result) )},
  addTask: (urls) => { dispatch(newTask(Date.now(), urls)) },
  inputUrl: (url) => { dispatch(inputUrl(url)) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
