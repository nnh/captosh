import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import ProgressStatus from './progress_status';

export default class CaptureView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captureTasks: [],
      result: '',
      capturing: false
    }
    this.handleStop = this.handleStop.bind(this);
    this.clearTask = this.clearTask.bind(this);
  }

  render() {
    return(
      <div>
        <Button bsStyle='default' onClick={this.clearTask} disabled={this.state.capturing}>表示をクリア</Button>
        <div className='capture-progress-container'>
          {
            this.state.captureTasks.map(task => {
              const buttonDisabled = task.status === ProgressStatus.done || task.status === ProgressStatus.stopped;
              return <ProgressView key={task.id} now={task.now} max={task.urls.length} status={task.status}
                buttonDisabled={buttonDisabled} stopTask={() => this.handleStop(task.id)} />
            })
          }
        </div>
        <div>{this.state.result}</div>
      </div>
    );
  }

  clearTask() {
    this.setState({ captureTasks: [], result: '' });
  }

  handleStop(id) {
    // const captureTasks = this.state.captureTasks.map(task => {
    //   if (task.id === id) {
    //     task.status = ProgressStatus.stopped;
    //   }
    //   return task;
    // });
    // this.setState({ captureTasks: captureTasks });

    const newTasks = this.state.captureTasks.map(t => ({ ...t, status: t.id === id ? ProgressStatus.stopped : t.status }));
    this.setState({ captureTasks: newTasks });
  }

  prepareCapture() {
    if (this.state.capturing) {
      return;
    } else {
      this.setState({ capturing: true });
      this.capture();
    }
  }

  async capture() {
    for (let i = 0; i < this.state.captureTasks.length; i++) {
      const task = this.state.captureTasks[i];

      for (let j = 0; j < task.urls.length; j++) {
        if (task.status === ProgressStatus.done || task.status === ProgressStatus.stopped) {
          break;
        }

        const url = task.urls[j];

        let targetUrl = url;
        let targetFileName = null;
        if (url.includes(',')) {
          targetUrl = url.split(',')[0];
          targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
        }

        const result = await this.props.savePDFWithAttr(targetUrl, targetFileName);
        const captureTasks = this.state.captureTasks.map(captureTask => {
          if (captureTask.id === task.id) {
            captureTask.now = j + 1;
            if (captureTask.status === ProgressStatus.waiting) {
              captureTask.status = ProgressStatus.running;
            }
            if (captureTask.urls.length === captureTask.now) {
              captureTask.status = ProgressStatus.done;
            }
          }
          return captureTask;
        });
        this.setState({captureTasks: captureTasks,　result: this.state.result += result ? result.errorText : '' });
      }
    }

    this.setState({ capturing: false });
  }
}

const ProgressView = ({ now, max, status, buttonDisabled, stopTask }) => (
  <div className='row'>
    <div className='col-xs-8'>
      <ProgressBar min={0} now={now} max={max} />
    </div>
    <div className='col-xs-2'>
      <div className='progress-num'>{`${now} / ${max}`}</div>
    </div>
    <div className='col-xs-1'>
      <Button bsStyle={buttonDisabled ? 'warning' : 'danger'} disabled={buttonDisabled} onClick={stopTask}>
        中止
      </Button>
    </div>
    <div className='col-xs-1'>
      <div className='progress-status'>{status}</div>
    </div>
  </div>
);
