export const newTask = (id, urls) => ({
  type: ActionType.new,
  id,
  urls
});

export const addProgress = (id, result) => ({
  type: ActionType.add,
  id,
  result
});

export const stopTask = (id) => ({
  type: ActionType.stop,
  id
});

export const clearView = () => ({
  type: ActionType.clear
});

export const startCapture = () => ({
  type: ActionType.start
});

export const endCapture = () => ({
  type: ActionType.end
});

export const ActionType = {
  new: 'NEW_TASK',
  add: 'ADD_PROGRESS',
  stop: 'STOP_TASK',
  clear: 'CLEAR_VIEW',
  start: 'START_CAPTURE',
  end: 'END_CAPTURE'
}
