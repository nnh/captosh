export const newTask = (id: number, tasks: Task[]) => ({
  type: ActionType.new,
  id,
  tasks
});

export const addProgress = (id: number, result: string) => ({
  type: ActionType.add,
  id,
  result
});

export const stopTask = (id: number) => ({
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

export const inputUrl = (url: string) => ({
  type: ActionType.input,
  url
})

export const ActionType = {
  new: 'NEW_TASK',
  add: 'ADD_PROGRESS',
  stop: 'STOP_TASK',
  clear: 'CLEAR_VIEW',
  start: 'START_CAPTURE',
  end: 'END_CAPTURE',
  input: 'INPUT_URL'
}
