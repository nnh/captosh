import { connect } from 'react-redux';
import { addProgress, startCapture, endCapture } from '../actions';
import CaptureView from '../components/capture_view';
import ProgressStatus from '../progress_status';

const mapStateToProps = (state) => ({
  captureTasks: state.captureTasks,
  result: state.resultText,
  capturing: state.captureState,
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
  count: (id, result) => { dispatch(addProgress(id, result) )}
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CaptureView);
