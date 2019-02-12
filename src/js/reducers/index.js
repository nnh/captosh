import { combineReducers } from 'redux';
import { ActionType } from '../actions'
import ProgressStatus from '../progress_status';

const captureTasks = (state = [], action) => {
  switch (action.type) {
    case ActionType.new:
      return state.concat([{ id: action.id, now: 0, urls: action.urls, status: ProgressStatus.waiting }]);
    case ActionType.add:
      return state.map((task) => {
        if ([ProgressStatus.stopped, ProgressStatus.done].includes(task.status)) return task;

        const newStatus =  task.urls.length === task.now + 1 ? ProgressStatus.done : ProgressStatus.running;
        return task.id === action.id ? { ...task, now: task.now + 1, status: newStatus } : task;
      });
    case ActionType.stop:
      return state.map((task) => action.id === task.id ? { ...task, status: ProgressStatus.stopped } : task);
    case ActionType.clear:
      return [];
    default:
      return state;
  }
}

const captureState = (state = false, action) => {
  switch (action.type) {
    case ActionType.start:
      return true;
    case ActionType.end:
      return false;
    default:
      return state;
  }
}

const resultText = (state = '', action) => {
  switch (action.type) {
    case ActionType.add:
      return state + action.result;
    case ActionType.clear:
      return '';
    default:
      return state;
  }
}

export default combineReducers({
  captureTasks,
  captureState,
  resultText
});
