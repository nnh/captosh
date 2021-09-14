import * as fs from 'fs-extra';
import * as  moment from 'moment-timezone';

import { remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import * as React from 'react';
import { Navbar, Button, Checkbox } from 'react-bootstrap';

import * as TabGroup from 'electron-tabs';
import { ConnectedProps } from 'react-redux';

import connector from '../containers/main_container';
import CaptureView from '../components/capture_view';
import BookmarkView from '../components/bookmark_view';
import { captureCaptoshLink, customSchemeRegExp } from '../scheme';

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = {
  defaultUrl: string,
} & PropsFromRedux;

class MainView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.submit = this.submit.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.save = this.save.bind(this);
    this.selectFolder = this.selectFolder.bind(this);
    this.savePDFWithAttr = this.savePDFWithAttr.bind(this);
    this.request = this.request.bind(this);
    this.showDialog = this.showDialog.bind(this);
  }

  tabGroup!: TabGroup;

  componentDidMount() {
    if (!this.tabGroup) {
      this.tabGroup = new TabGroup();
      this.createTab();
    }
  }

  componentDidUpdate() {
    if (this.props.ptoshUrl) { this.request(this.props.ptoshUrl) };
  }

  render = () => (
    <div>
      <Navbar>
        <div className='tab-container'>
          <Navbar.Brand>captosh</Navbar.Brand>
          <div className='add-tab-button-container'>
            <Button className='add-tab-button' bsStyle='default' title='タブ追加' onClick={() => this.createTab()}><i className='fa fa-plus'></i></Button>
          </div>
          <div className='etabs-tabgroup'>
            <div className='etabs-tabs'></div>
            <div className='etabs-buttons'></div>
          </div>
        </div>
        <BookmarkView submit={this.submit} currentUrl={this.props.src} currentTitle={this.props.title} />
      </Navbar>

      <div className='etabs-views'>
        <div className='form-inline'>
          <Button bsStyle='default' title='前に戻る' onClick={this.goBack}><i className='fa fa-arrow-left'></i></Button>
          <Button bsStyle='default' title='次に進む' onClick={this.goForward}><i className='fa fa-arrow-right'></i></Button>
          <Button bsStyle='default' title='再読み込み' onClick={() => this.tabGroup.getActiveTab()?.webview.reload()}><i className='fa fa-refresh'></i></Button>
          <input className='url-bar form-control' type='text' placeholder='url'
            value={this.props.urlBar} onChange={(e) => this.props.inputUrl(e.target.value)} onKeyPress={this.keyPress} />
          <Button bsStyle='default' title='移動' onClick={() => this.submit()}><i className='fa fa-sign-in'></i></Button>
          <Button bsStyle='default' title='スクリーンショット撮影' onClick={this.save}><i className='fa fa-camera'></i></Button>
          <span>保存先ルート</span>
          <textarea className='folder-text form-control' rows={1} wrap='off' value={this.props.folderText} readOnly></textarea>
          <Button bsStyle='default' title='保存先ルートフォルダ選択' onClick={this.selectFolder}><i className='fa fa-folder'></i></Button>
          <Checkbox className='pdf-checkbox' checked={this.props.printDatetime} inline onChange={this.props.togglePrintDatetime}>日時を印字する</Checkbox>
          <Checkbox className='pdf-checkbox' checked={this.props.printUrl} inline onChange={this.props.togglePrintUrl}>URLを印字する</Checkbox>
          <Button bsStyle='default' title='まとめてキャプチャー' onClick={this.props.toggleContainer}><i className='fa fa-copy'></i></Button>
        </div>
        <div className='capture-container'>
          <CaptureView savePDFWithAttr={this.savePDFWithAttr} showContainer={this.props.showContainer} />
        </div>
      </div>
    </div>
  );

  addTab(url: string, active: boolean) {
    const tab = this.tabGroup.addTab({
      title: 'blank',
      src: url,
      visible: true,
      active: active,
      webviewAttributes: { partition: 'persist:ptosh' }
    });
    tab.webview.preload = './js/webview.js';
    return tab;
  }

  createTab(url = this.props.defaultUrl, active = true) {
    const tab = this.addTab(url, active);
    tab.on('active', (tab) => {
      this.props.inputUrl(tab.webview.src);
      this.props.setWebviewStatus(tab.webview.src, tab.webview.getTitle());
    });
    tab.webview.addEventListener('did-stop-loading', () => {
      if (active) {
        this.props.inputUrl(tab.webview.src);
        this.props.setWebviewStatus(tab.webview.src, tab.webview.getTitle());
      }
      tab.setTitle(tab.webview.getTitle());
      // tab.webview.openDevTools();
    });
    tab.webview.addEventListener('new-window', (e) => {
      if (this.props.shift && this.props.cmdOrCtrl) {
        this.createTab(e.url, false);
      } else {
        this.createTab(e.url);
      }
    });
  }

  keyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { this.submit(); }
  }

  submit(src = this.props.urlBar) {
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      if (src.match(customSchemeRegExp)) {
        this.request(src)
      } else {
        tab.webview.src = src;
      }
    }
  }

  goBack() {
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      const webview = tab.webview;
      if (webview.canGoBack()) { webview.goBack(); }
    }
  }

  goForward() {
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      const webview = tab.webview;
      if (webview.canGoForward()) { webview.goForward(); }
    }
  }

  async save() {
    try {
      await this.savePDF(undefined, undefined);
    } catch (error) {
      this.showDialog(error.message);
    }
  }

  async selectFolder() {
    const bw = BrowserWindow.getFocusedWindow();
    if (bw) {
      const result = await dialog.showOpenDialog(bw, {
        properties: ['openDirectory']
      });
      if (result.filePaths[0]) { this.props.changeFolder(result.filePaths[0]); }
    }
  }

  getSavePDFPath(src: string, today: Date, fileName?: string) {
    const saveDirectory = this.props.folderText;
    if (fileName) {
      return `${saveDirectory}/${fileName}`;
    }

    const trialName = src.split('/')[4];
    const sheetName = src.split('/')[8];
    const datetime = moment(today).tz('Asia/Tokyo').format('YYYYMMDD_HHmmssSSS');
    return `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${datetime}.pdf`;
  }

  async savePDF(webview = this.tabGroup.getActiveTab()?.webview, fileName?: string) {
    if (webview) {
      const today = new Date();

      if (this.props.printUrl) {
        const script = `window.insertUrl("${webview.src}")`;
        await webview.executeJavaScript(script);
      }
      if (this.props.printDatetime) {
        const script = `window.insertDatetime("${moment(today).tz('Asia/Tokyo').format()}")`;
        await webview.executeJavaScript(script);
      }

      const path = this.getSavePDFPath(webview.src, today, fileName);
      const bindedPrintToPDF = webview.printToPDF.bind(webview);

      try {
        const data = await bindedPrintToPDF({ printBackground: true });
        fs.ensureFileSync(path);
        await fs.promises.writeFile(path, data);
      } finally {
        const script = 'window.removeInsertedElements()';
        await webview.executeJavaScript(script);
      }
    }
  }

  async savePDFWithAttr(targetUrl: string, targetFileName?: string) {
    const tab = this.addTab(targetUrl, false);
    const didStopLoading = () => {
      return new Promise(resolve => {
        tab.webview.addEventListener('did-stop-loading', resolve);
      });
    }

    try {
      await didStopLoading();
      if (tab.webview.src.indexOf('users/sign_in') !== -1) {
        this.props.clearView();
        this.requireSignin(tab.webview.src);
      } else {
        await this.savePDF(tab.webview, targetFileName);
      }
    } catch (error) {
      return { errorText: `${targetUrl}の保存に失敗しました。(${error.message})\n` };
    } finally {
      tab.close();
    }
  }

  async request(captoshUrl: string) {
    this.props.clearPtoshUrl();
    if (!this.props.showContainer) { this.props.toggleContainer(); }

    const currentUrl = new URL(this.tabGroup.getActiveTab()?.webview?.src ?? 'https://example.com');

    try {
      const tasks = await captureCaptoshLink(captoshUrl, currentUrl.protocol as 'http:' | 'https:')
      this.props.addTask(tasks);
    } catch(error) {
      if (error.url) {
        this.requireSignin(error.url);
      } else {
        this.showDialog(error.message);
      }
    }
  }

  requireSignin(url: string) {
    this.props.toggleContainer();
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      tab.webview.src = new URL(url).origin;
      this.showDialog('captoshアプリ内でptoshにログインしていません。ログイン後に再度実行してください。');
    } else {
      this.showDialog('タブを開いてください。');
    }
  }

  showDialog(message: string) {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const options = {
        type: 'error',
        buttons: ['閉じる'],
        title: 'error',
        message: 'error',
        detail: message
      };
      dialog.showMessageBox(win, options);
    }
  }
}

export default connector(MainView);
