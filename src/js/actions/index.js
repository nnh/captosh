import ProgressStatus from "../progress_status";

export const newTask = (id, urls) => ({
  type: ActionType.new,
  id,
  urls,
  now: 0,
  status: ProgressStatus.waiting
});

export const addProgress = (id, now) => ({
  type: ActionType.add,
  id,
  now,
  status: ProgressStatus.running
});

export const stopTask = (id) => ({
  type: ActionType.stop,
  id,
  status: ProgressStatus.stopped
});

export const clearView = () => ({
  type: ActionType.clear
});

export const startCapture = () => ({
  type: ActionType.start,
  capturing: true
});

export const endCapture = () => ({
  type: ActionType.end,
  capturing: false
});

export const addResult = (text) => ({
  type: ActionType.result,
  result: text
});

export const ActionType = {
  new: 'NEW_TASK',
  add: 'ADD_PROGRESS',
  stop: 'STOP_TASK',
  clear: 'CLEAR_VIEW',
  start: 'START_CAPTURE',
  end: 'END_CAPTURE',
  result: 'ADD_RESULT'
}
