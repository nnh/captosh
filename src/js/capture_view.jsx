import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import ProgressStatus from './progress_status';

export default class CaptureView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      captureTasks: [],
      stopRequests: {},
      result: '',
      capturing: false
    }
    this.handleStop = this.handleStop.bind(this);
    this.clearTask = this.clearTask.bind(this);
  }

  render = () => (
    <div>
      <Button bsStyle='default' onClick={this.clearTask} disabled={this.state.capturing}>表示をクリア</Button>
      <div className='capture-progress-container'>
        {
          this.state.captureTasks.map(task => (
            <ProgressView key={task.id} now={task.now} max={task.urls.length} status={task.status} stopTask={() => this.handleStop(task.id)}
                          buttonDisabled={task.status === ProgressStatus.done || task.status === ProgressStatus.stopped} />
          ))
        }
      </div>
      <div>{this.state.result}</div>
    </div>
  );

  clearTask() {
    this.setState({ captureTasks: [], result: '' });
  }

  handleStop(id) {
    this.setState({ stopRequests: { ...this.state.stopRequests, [id]: true } });
  }

  async capture() {
    this.setState({ capturing: true });

    for (let i = 0; i < this.state.captureTasks.length; i++) {
      const task = this.state.captureTasks[i];

      for (let j = 0; j < task.urls.length; j++) {
        if (task.status === ProgressStatus.done) break;
        if (this.state.stopRequests[task.id]) {
          delete this.state.stopRequests[task.id];
          task.status = ProgressStatus.stopped;
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

  async captureFromUrls(passedUrls) {
    const task = { id: Date.now(), urls: passedUrls.filter(v => v), now: 0, status: ProgressStatus.waiting };
    this.setState({ captureTasks: this.state.captureTasks.concat(task) }, () =>  {
      if (!this.state.capturing) this.capture();
    });
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
