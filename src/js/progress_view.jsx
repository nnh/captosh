import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import ProgressStatus from './progress_status';

export default class ProgressView extends React.Component {
  constructor(props) {
    super(props);
    this.stopTask = this.stopTask.bind(this);
  }

  render() {
    const buttonDisabled = this.props.status === ProgressStatus.done || this.props.status === ProgressStatus.stopped;
    return(
      <div className='row'>
        <div className='col-xs-8'>
          <ProgressBar min={0} now={this.props.now} max={this.props.max} />
        </div>
        <div className='col-xs-2'>
          <div className='progress-num'>{`${this.props.now} / ${this.props.max}`}</div>
        </div>
        <div className='col-xs-1'>
          <Button bsStyle={buttonDisabled ? 'warning' : 'danger'}
                  disabled={buttonDisabled} onClick={this.stopTask}>
            中止
          </Button>
        </div>
        <div className='col-xs-1'>
          <div className='progress-status'>{this.props.status}</div>
        </div>
      </div>
    );
  }

  stopTask() {
    this.props.handleStop(this.props.id);
  }
}
