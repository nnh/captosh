import React from 'react';
import ProgressStatus from '../progress_status';
import ClearContainer from '../containers/clear_container';
import ProgressView from './progress_view';

class CaptureView extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => (
    <div>
      <ClearContainer capturing={this.props.capturing} />
      <div className='capture-progress-container'>
        {
          this.props.captureTasks.map(task => (
            <ProgressView key={task.id} taskId={task.id}
                          now={task.now} max={task.urls.length} status={task.status}
                          disabled={[ProgressStatus.stopped, ProgressStatus.done].includes(task.status)} />
          ))
        }
      </div>
      <div>{this.props.result}</div>
    </div>
  );

  componentDidUpdate(prevProps, prevState) {
    if (this.props.capturable()) this.capture();
  }

  async capture() {
    this.props.startCapture();

    const task = this.props.nextTask();
    if (task) {
      const url = task.url;
      let targetUrl = url;
      let targetFileName = null;
      if (url.includes(',')) {
        targetUrl = url.split(',')[0];
        targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
      }

      const result = await this.props.savePDFWithAttr(targetUrl, targetFileName);
      this.props.count(task.id, result && result.errorText ? result.errorText : '');
      this.capture();
    } else {
      this.props.endCapture();
    }
  }
}

export default CaptureView;
