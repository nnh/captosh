export type ProgressStatusType =
  '待機中' |
  '実行中' |
  '中止' |
  '終了';

export const ProgressStatus: {[T: string]: ProgressStatusType} = {
  waiting: '待機中',
  running: '実行中',
  stopped: '中止',
  done: '終了'
};
