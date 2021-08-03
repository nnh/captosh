import fs from 'fs-extra';
import moment from 'moment-timezone';
import Url from 'url';
import util from 'util';

import { remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import React from 'react';
import { Navbar, Button, Checkbox } from 'react-bootstrap';

import TabGroup from 'electron-tabs';

import CaptureContainer from '../containers/capture_container';
import BookmarkContainer from '../containers/bookmark_container';

class MainView extends React.Component {
  constructor(props) {
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
        <BookmarkContainer showDialog={this.showDialog} submit={this.submit} bookmarks={{}} currentUrl={this.props.src} currentTitle={this.props.title} />
      </Navbar>

      <div className='etabs-views'>
        <div className='form-inline'>
          <Button bsStyle='default' title='前に戻る' onClick={this.goBack}><i className='fa fa-arrow-left'></i></Button>
          <Button bsStyle='default' title='次に進む' onClick={this.goForward}><i className='fa fa-arrow-right'></i></Button>
          <Button bsStyle='default' title='再読み込み' onClick={() => this.tabGroup.getActiveTab().webview.reload()}><i className='fa fa-refresh'></i></Button>
          <input className='url-bar form-control' type='text' placeholder='url'
            value={this.props.urlBar} onChange={(e) => this.props.inputUrl(e.target.value)} onKeyPress={this.keyPress} />
          <Button bsStyle='default' title='移動' onClick={() => this.submit()}><i className='fa fa-sign-in'></i></Button>
          <Button bsStyle='default' title='スクリーンショット撮影' onClick={this.save}><i className='fa fa-camera'></i></Button>
          <span>保存先ルート</span>
          <textarea className='folder-text form-control' rows='1' wrap='off' value={this.props.folderText} readOnly></textarea>
          <Button bsStyle='default' title='保存先ルートフォルダ選択' onClick={this.selectFolder}><i className='fa fa-folder'></i></Button>
          <Checkbox className='pdf-checkbox' checked={this.props.printDatetime} inline onChange={this.props.togglePrintDatetime}>日時を印字する</Checkbox>
          <Checkbox className='pdf-checkbox' checked={this.props.printUrl} inline onChange={this.props.togglePrintUrl}>URLを印字する</Checkbox>
          <Button bsStyle='default' title='まとめてキャプチャー' onClick={this.props.toggleContainer}><i className='fa fa-copy'></i></Button>
        </div>
        <div className='capture-container'>
          <CaptureContainer savePDFWithAttr={this.savePDFWithAttr} captureTasks={[]} capturing={false} result={''} showContainer={this.props.showContainer} />
        </div>
      </div>
    </div>
  );

  createTab(url = this.props.defaultUrl, active = true) {
    const tab = this.tabGroup.addTab({
      title: 'blank',
      src: url,
      visible: true,
      active: active,
      webviewAttributes: { partition: 'persist:ptosh' }
    });
    tab.on('active', (tab) => {
      this.props.inputUrl(tab.webview.src);
      this.props.setWebviewStatus(tab.webview.src, tab.webview.getTitle());
    });
    tab.webview.preload = './js/webview.js';
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

  keyPress(e) {
    if (e.key === 'Enter') { this.submit(); }
  }

  submit(src = this.props.urlBar) {
    this.tabGroup.getActiveTab().webview.src = src;
  }

  goBack() {
    const webview = this.tabGroup.getActiveTab().webview;
    if (webview.canGoBack()) { webview.goBack(); }
  }

  goForward() {
    const webview = this.tabGroup.getActiveTab().webview;
    if (webview.canGoForward()) { webview.goForward(); }
  }

  async save() {
    try {
      await this.savePDF();
    } catch (error) {
      this.showDialog(error.message);
    }
  }

  async selectFolder() {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      properties: ['openDirectory']
    });
    if (result.filePaths[0]) { this.props.changeFolder(result.filePaths[0]); }
  }

  getSavePDFPath(src, today, fileName) {
    const saveDirectory = this.props.folderText;
    if (fileName) {
      return `${saveDirectory}/${fileName}`;
    }

    const trialName = src.split('/')[4];
    const sheetName = src.split('/')[8];
    const datetime = moment(today).tz('Asia/Tokyo').format('YYYYMMDD_HHmmssSSS');
    return `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${datetime}.pdf`;
  }

  async savePDF(webview = this.tabGroup.getActiveTab().webview, fileName) {
    const today = new Date();

    if (this.props.printUrl) {
      webview.send('insert-url', webview.src);
    }
    if (this.props.printDatetime) {
      webview.send('insert-datetime', moment(today).tz('Asia/Tokyo').format());
    }

    const path = this.getSavePDFPath(webview.src, today, fileName);
    const printToPDF = () => util.promisify(webview.printToPDF.bind(webview))({ printBackground: true });
    const writeFile = util.promisify(fs.writeFile);

    try {
      const data = await printToPDF();
      fs.ensureFileSync(path);
      await writeFile(path, data);
    } finally {
      webview.send('remove-inserted-element');
    }
  }

  async savePDFWithAttr(targetUrl, targetFileName) {
    const tab = this.tabGroup.addTab({
      title: 'blank',
      src: targetUrl,
      visible: true,
      webviewAttributes: { partition: 'persist:ptosh' }
    });
    tab.webview.preload = './js/webview.js';
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

  async request(url) {
    this.props.clearPtoshUrl();
    if (!this.props.showContainer) { this.props.toggleContainer(); }

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        redirect: 'manual'
      });
      if (response.type === 'opaqueredirect' || response.status === 401) {
        this.requireSignin(response.url);
        return;
      }

      const text = await response.text();
      const targetUrl = new Url.URL(url);
      const urls = text.split(/\n/).map((value) => {
        const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;
        if (value.includes(',')) {
          return `${new Url.URL(value.split(',')[0], baseUrl).href},${value.split(',')[1]}`;
        } else {
          return new Url.URL(value, baseUrl).href;
        }
      });

      this.props.addTask(urls);
    } catch(error) {
      this.showDialog(error.message);
    }
  }

  requireSignin(url) {
    this.props.toggleContainer();
    this.tabGroup.getActiveTab().webview.src = new URL(url).origin;
    this.showDialog('captoshアプリ内でptoshにログインしていません。ログイン後に再度実行してください。');
  }

  showDialog(message) {
    const win = BrowserWindow.getFocusedWindow();
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

export default MainView;
