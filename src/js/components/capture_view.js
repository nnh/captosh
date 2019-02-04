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
    if (!this.props.capturing && this.props.captureTasks.length > 0) this.capture();
  }

  async capture() {
    this.props.startCapture();

    for (let i = 0; i < this.props.captureTasks.length; i++) {
      for (let j = 0; j < this.props.captureTasks[i].urls.length; j++) {
        const task = this.props.captureTasks[i];
        if ([ProgressStatus.stopped, ProgressStatus.done].includes(task.status)) break;

        const url = task.urls[j];
        let targetUrl = url;
        let targetFileName = null;
        if (url.includes(',')) {
          targetUrl = url.split(',')[0];
          targetFileName = url.split(',')[1].replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_');
        }

        const result = await this.props.savePDFWithAttr(targetUrl, targetFileName);
        this.props.count(task.id, j + 1);
        if (result) this.props.error(result.errorText);
      }
    }

    this.props.endCapture();
  }
}

export default CaptureView;
