import React from 'react';
import { Button } from 'react-bootstrap';
import ProgressView from './progress_view';
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
              return <ProgressView key={task.id} id={task.id} now={task.now} max={task.urls.length} status={task.status} handleStop={this.handleStop} />
            })
          }
        </div>
        <div>{this.state.result}</div>
      </div>
    );
  }

  clearTask() {
    this.setState(state => {
      return {
        captureTasks: [],
        result: ''
      };
    });
  }

  handleStop(id) {
    this.setState(state => {
      const captureTasks = this.state.captureTasks.map(task => {
        if (task.id === id) {
          task.status = ProgressStatus.stopped;
        }
        return task;
      });
      return { captureTasks: captureTasks };
    });
  }

  prepareCapture() {
    if (this.state.capturing) {
      return;
    } else {
      this.setState(() => {
        return { capturing: true }
      }, () => {
        this.capture();
      });
    }
  }

  async capture() {
    for (let i = 0; i < this.state.captureTasks.length; i++) {
      const task = this.state.captureTasks[i];

      for (let j = 0; j < task.urls.length; j++) {
        if (task.status === ProgressStatus.done || task.status === ProgressStatus.stopped) {
          break;
        }

        // ファイル名に秒を使っているので、上書きしないために最低１秒空けている。
        await sleep(1000);
        const url = task.urls[j];

        let targetUrl = url;
        let targetFileName = null;
        if (url.includes(',')) {
          targetUrl = url.split(',')[0];
          targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
        }

        const result = await this.props.savePDFWithAttr(targetUrl, targetFileName);
        this.setState((state) => {
          const captureTasks = state.captureTasks.map(captureTask => {
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
          return {
            captureTasks: captureTasks,
            result: state.result += result ? result.errorText : ''
          };
        });
      }
    }

    this.setState(state => {
      return { capturing: false }
    });
  }
}
