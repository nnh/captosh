import React from 'react';
import { Button } from 'react-bootstrap';
import parse from 'csv-parse/lib/sync';

import ProgressStatus from '../progress_status';
import ClearContainer from '../containers/clear_container';
import ProgressView from './progress_view';

class CaptureView extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  render() {
    if (!this.props.showContainer) return null;
    return (
      <div>
        <p>キャプチャーしたいページのURLを入力してください。（改行で複数ページ行います）</p>
        <textarea className='form-control' rows='10' value={this.props.urls} onChange={(e) => this.props.inputUrl(e.target.value)}></textarea>
        <Button className='capture-button' bsStyle='default' onClick={this.onClick}>開始</Button>
        <ClearContainer capturing={this.props.capturing} />
        <div className='capture-progress-container'>
          {
            this.props.captureTasks.map(task => (
              <ProgressView key={task.id} taskId={task.id} now={task.now} max={task.urls.length} status={task.status}
                            disabled={[ProgressStatus.stopped, ProgressStatus.done].includes(task.status)} />
            ))
          }
        </div>
        <div>{this.props.result}</div>
      </div>
    );
  }

  componentDidUpdate() {
    if (this.props.capturable()) this.capture();
  }

  onClick() {
    if (this.props.urls.length > 0) {
      this.props.addTask(this.props.urls.split('\n').filter(v => v));
    }
  }

  async capture() {
    this.props.startCapture();

    const task = this.props.nextTask();
    if (task) {
      const line = parse(task.url)[0];
      const [targetUrl, targetFileName] = line;
      const fileName = targetFileName ? targetFileName.replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_') : null;

      const result = await this.props.savePDFWithAttr(targetUrl, fileName);
      this.props.count(task.id, result && result.errorText ? result.errorText : '');
      this.capture();
    } else {
      this.props.endCapture();
    }
  }
}

export default CaptureView;
