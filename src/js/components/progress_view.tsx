import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import StopContainer from '../containers/stop_container';
import { ProgressStatusType } from '../progress_status'

const ProgressView = ({ now, max, status, disabled, taskId }: {now: number, max: number, status: ProgressStatusType,disabled: boolean, taskId: number}) => (
  <div className='row'>
    <div className='col-xs-8'>
      <ProgressBar min={0} now={now} max={max} />
    </div>
    <div className='col-xs-2'>
      <div className='progress-num'>{`${now} / ${max}`}</div>
    </div>
    <div className='col-xs-1'>
      <StopContainer taskId={taskId} disabled={disabled} />
    </div>
    <div className='col-xs-1'>
      <div className='progress-status'>{status}</div>
    </div>
  </div>
);

export default ProgressView;
