import { connect } from 'react-redux';
import { newTask, addProgress, startCapture, endCapture, inputUrl } from '../actions';
import CaptureView from '../components/capture_view';
import { ProgressStatus, ProgressStatusType } from '../progress_status';

export type TaskType = {
  id: number,
  url?: string,
  urls: string[],
  now: number,
  status: ProgressStatusType,
};

export type CaptureState = {
  captureTasks: TaskType[],
  resultText: string,
  captureState: boolean,
  inputUrl: string,
}

const mapStateToProps = (state: CaptureState) => ({
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
  count: (id: number, result: string) => { dispatch(addProgress(id, result) )},
  addTask: (urls: string[]) => { dispatch(newTask(Date.now(), urls)) },
  inputUrl: (url: string) => { dispatch(inputUrl(url)) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
