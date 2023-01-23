import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { newTask, addProgress, startCapture, endCapture, inputUrl } from '../actions';
import { ProgressStatus, ProgressStatusType } from '../progress_status';

export type CaptureTasksType = {
  id: number,
  tasks: Task[],
  now: number,
  status: ProgressStatusType,
};

export type CaptureState = {
  captureTasks: CaptureTasksType[],
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
    return t && { id: t.id, task: t.tasks[t.now] };
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startCapture: () => { dispatch(startCapture()) },
  endCapture: () => { dispatch(endCapture()) },
  count: (id: number, result: string) => { dispatch(addProgress(id, result) )},
  addTask: (tasks: Task[]) => { dispatch(newTask(Date.now(), tasks)) },
  inputUrl: (url: string) => { dispatch(inputUrl(url)) }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
