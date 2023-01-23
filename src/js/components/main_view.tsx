import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.locale('ja')
dayjs.extend(utc)
dayjs.extend(timezone)

import * as React from 'react';
import { Navbar, Button, Checkbox } from 'react-bootstrap';

import { TabGroup } from 'electron-tabs';
import { ConnectedProps } from 'react-redux';

import connector from '../containers/main_container';
import CaptureView from '../components/capture_view';
import BookmarkView from '../components/bookmark_view';
import { customSchemeRegExp } from '../scheme';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['tab-group']: React.DetailedHTMLProps<React.HTMLAttributes<TabGroup>, TabGroup>;
    }
  }
}

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = {
  defaultUrl: string,
} & PropsFromRedux;

class MainView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.tabGroupElement = React.createRef<TabGroup>();

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

  tabGroupElement!: React.RefObject<TabGroup>;
  tabGroup!: TabGroup;

  componentDidMount() {
    const e = this.tabGroupElement.current;
    if (e) {
      this.tabGroup = e;
      this.createTab();
    }
  }

  componentDidUpdate() {
    if (this.props.ptoshUrl) { this.request(this.props.ptoshUrl) };
  }

  render = () => (
    <div>
      <BookmarkView submit={this.submit} currentUrl={this.props.src} currentTitle={this.props.title} />
      <div className='etabs-views'>
        <div className='form-inline'>
          <Button bsStyle='default' title='前に戻る' onClick={this.goBack}><i className='fa-solid fa-left-long'></i></Button>
          <Button bsStyle='default' title='次に進む' onClick={this.goForward}><i className='fa-solid fa-arrow-right'></i></Button>
          <Button bsStyle='default' title='再読み込み' onClick={() => this.tabGroup.getActiveTab()?.webview.reload()}><i className='fa-solid fa-refresh'></i></Button>
          <Button className='add-tab-button' bsStyle='default' title='タブ追加' onClick={() => this.createTab()}><i className='fa-solid fa-plus'></i></Button>
          <input className='url-bar form-control' type='text' placeholder='url'
            value={this.props.urlBar} onChange={(e) => this.props.inputUrl(e.target.value)} onKeyPress={this.keyPress} />
          <Button bsStyle='default' title='移動' onClick={() => this.submit()}><i className='fa-solid fa-sign-in'></i></Button>
          <Button bsStyle='default' title='スクリーンショット撮影' onClick={this.save}><i className='fa-solid fa-camera'></i></Button>
          <span>保存先ルート</span>
          <textarea className='folder-text form-control' rows={1} wrap='off' value={this.props.folderText} readOnly></textarea>
          <Button bsStyle='default' title='保存先ルートフォルダ選択' onClick={this.selectFolder}><i className='fa-solid fa-folder'></i></Button>
          <Checkbox className='pdf-checkbox' checked={this.props.printDatetime} inline onChange={this.props.togglePrintDatetime}>日時を印字する</Checkbox>
          <Checkbox className='pdf-checkbox' checked={this.props.printUrl} inline onChange={this.props.togglePrintUrl}>URLを印字する</Checkbox>
          <Button bsStyle='default' title='まとめてキャプチャー' onClick={this.props.toggleContainer}><i className='fa-solid fa-copy'></i></Button>
        </div>
        <div className='capture-container'>
          <CaptureView savePDFWithAttr={this.savePDFWithAttr} showContainer={this.props.showContainer} />
        </div>
      </div>
      <tab-group ref={this.tabGroupElement} />
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
    const webview = tab.webview as Electron.WebviewTag;
    webview.addEventListener('dom-ready', () => {
      //webview.openDevTools();

      const script =
        "window.insertElement = (id, arg) => {\n" +
        "  const div = document.createElement('div');\n" +
        "  div.id = id;\n" +
        "  div.style.cssText = 'text-align:right; width:100%; background:white; font-size:15px';\n" +
        "  div.innerText = arg;\n" +
        "  const parent = document.getElementById('cover') ?? document.body;\n" +
        "  parent.insertBefore(div, parent.firstChild);\n" +
        "  // display:noneが別のcssに上書きされて無視されることがあるのでimportantを付与\n" +
        "  document.querySelectorAll('*[style*=\"display: none\"]').forEach((e) => e.style.setProperty('display', 'none', 'important'));\n" +
        "};" +
        "window.removeInsertedElements = () => {\n" +
        "  const datetime = document.getElementById('screenshot-datetime')\n" +
        "  if (datetime) {\n" +
        "    datetime.remove();\n" +
        "  }\n" +
        "  const url = document.getElementById('screenshot-url')\n" +
        "  if (url) {\n" +
        "    url.remove();\n" +
        "  }\n" +
        "  // 付与したimportantを元に戻す\n" +
        "  document.querySelectorAll('*[style*=\"display: none\"]').forEach((e) => e.style.setProperty('display', 'none'));\n" +
        "}\n" +
        "undefined";
      webview.executeJavaScript(script);
    });
    return tab;
  }

  createTab(url = this.props.defaultUrl, active = true) {
    const tab = this.addTab(url, active);
    tab.on('active', (tab) => {
      this.props.inputUrl(tab.webview.src);
      this.props.setWebviewStatus(tab.webview.src, tab.webview.getTitle());
    });
    const webview = tab.webview as Electron.WebviewTag;
    webview.addEventListener('did-stop-loading', () => {
      if (active) {
        this.props.inputUrl(webview.src);
        this.props.setWebviewStatus(webview.src, webview.getTitle());
      }
      tab.setTitle(webview.getTitle());
    });
    tab.webview.addEventListener('new-window', (e: {url: string}) => {
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
      const webview = tab.webview as Electron.WebviewTag;
      if (src.match(customSchemeRegExp)) {
        this.request(src)
      } else {
        webview.src = src;
      }
    }
  }

  goBack() {
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      const webview = tab.webview as Electron.WebviewTag;
      if (webview.canGoBack()) { webview.goBack(); }
    }
  }

  goForward() {
    const tab = this.tabGroup.getActiveTab();
    if (tab) {
      const webview = tab.webview as Electron.WebviewTag;
      if (webview.canGoForward()) { webview.goForward(); }
    }
  }

  async save() {
    console.log("hello save PDF")
    try {
      const tab = this.tabGroup.getActiveTab();
      const webview = tab.webview as Electron.WebviewTag
      await this.savePDF(webview, undefined);
    } catch (error: any) {
      this.showDialog(error.message);
    }
  }

  async selectFolder() {
    const path = await window.electronAPI.selectFolder();
    if (path) {
      this.props.changeFolder(path);
    }
  }

  getSavePDFPath(src: string, today: Date, fileName?: string) {
    const saveDirectory = this.props.folderText;
    if (fileName) {
      return `${saveDirectory}/${fileName}`;
    }

    const trialName = src.split('/')[4];
    const sheetName = src.split('/')[8];
    const datetime = dayjs(today).tz('Asia/Tokyo').format('YYYYMMDD_HHmmssSSS');
    return `${saveDirectory}/ptosh_crf_image/${trialName}/${sheetName}/${datetime}.pdf`;
  }

  async savePDF(webview: Electron.WebviewTag, fileName?: string) {
    if (webview) {
      const today = new Date();

      try {
        if (this.props.printUrl) {
          const script = `window.insertElement('screenshot-url', "${webview.src}")`;
          await webview.executeJavaScript(script);
        }
        if (this.props.printDatetime) {
          const now = dayjs(today).tz('Asia/Tokyo').format()
          const script = `window.insertElement('screenshot-datetime', "${now}")`;
          await webview.executeJavaScript(script);
        }

        const path = this.getSavePDFPath(webview.src, today, fileName);
        const bindedPrintToPDF = webview.printToPDF.bind(webview);

        const data = await bindedPrintToPDF({ printBackground: true });
        await window.electronAPI.writeFile(path, data);
      }
      catch(e: any) {
        console.log({e});
      }
      finally {
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
      const webview = tab.webview as Electron.WebviewTag;
      if (webview.src.indexOf('users/sign_in') !== -1) {
        this.props.clearView();
        this.requireSignin(webview.src);
      } else {
        await this.savePDF(webview, targetFileName);
      }
    } catch (error: any) {
      return { errorText: `${targetUrl}の保存に失敗しました。(${error.message})\n` };
    } finally {
      tab.close(false);
    }
  }

  async request(captoshUrl: string) {
    this.props.clearPtoshUrl();
    if (!this.props.showContainer) { this.props.toggleContainer(); }
    const webview = this.tabGroup.getActiveTab().webview as Electron.WebviewTag;
    const currentUrl = new URL(webview.src ?? 'https://example.com');

    try {
      const tasks = await window.electronAPI.captureCaptoshLink(captoshUrl, currentUrl.protocol as 'http:' | 'https:');
      this.props.addTask(tasks);
    } catch(error: any) {
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
      const webview = tab.webview as Electron.WebviewTag;
      webview.src = new URL(url).origin;
      this.showDialog('captoshアプリ内でptoshにログインしていません。ログイン後に再度実行してください。');
    } else {
      this.showDialog('タブを開いてください。');
    }
  }

  showDialog(message: string) {
    window.electronAPI.showDialog(message);
  }
};

export default connector(MainView);
