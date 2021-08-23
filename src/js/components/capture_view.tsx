import * as React from 'react';
import { Button } from 'react-bootstrap';
import * as parse from 'csv-parse/lib/sync';
import { ConnectedProps } from 'react-redux';

import connector from '../containers/capture_container';
import { ProgressStatus } from '../progress_status';
import ClearButton from '../components/clear_button';
import ProgressView from './progress_view';
import { parseTasks } from '../scheme';

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = {
  showContainer: boolean,
  savePDFWithAttr: (url: string, fileName?: string) => any,
} & PropsFromRedux;

class CaptureView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  render() {
    if (!this.props.showContainer) return null;
    return (
      <div>
        <p>キャプチャーしたいページのURLを入力してください。（改行で複数ページ行います）</p>
        <textarea className='form-control' rows={10} value={this.props.urls} onChange={(e) => this.props.inputUrl(e.target.value)}></textarea>
        <Button className='capture-button' bsStyle='default' onClick={this.onClick}>開始</Button>
        <ClearButton capturing={this.props.capturing} />
        <div className='capture-progress-container'>
          {
            this.props.captureTasks.map(task => (
              <ProgressView key={task.id} taskId={task.id} now={task.now} max={task.tasks.length} status={task.status}
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
      const tasks = parseTasks(this.props.urls);
      this.props.addTask(tasks);
    }
  }

  async capture() {
    this.props.startCapture();

    const task = this.props.nextTask();
    if (task) {
      const fileName = task.task.path ? task.task.path.replace(/\.\.\//g, '').replace(/\\|\:|\*|\?|"|<|>|\||\s/g, '_') : undefined;
      const result = await this.props.savePDFWithAttr(task.task.url, fileName);
      this.props.count(task.id, result && result.errorText ? result.errorText : '');
      this.capture();
    } else {
      this.props.endCapture();
    }
  }
}

export default connector(CaptureView);
