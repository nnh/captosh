export default class CaptureView {
  constructor() {
    this.max = 0;
  }

  setView({ captureProgress, captureResult, progressBar }) {
    this.captureProgress = captureProgress;
    this.captureResult = captureResult;
    this.progressBar = progressBar;
  }

  resetView() {
    this.captureProgress.innerHTML = '';
    this.captureResult.innerHTML = '';
    this.progressBar.style['width'] = '0%';
  }

  initializeView(length) {
    this.max = length;
    this.progressBar.setAttribute('aria-valuenow', 0);
    this.progressBar.setAttribute('aria-valuemax', this.max);
    this.captureProgress.innerText = `0 / ${this.max}`;
  }

  updateView(now, errorText) {
    this.progressBar.setAttribute('aria-valuenow', now);
    this.progressBar.style['width'] = `${(now) * 100 / this.max}%`;
    this.captureProgress.innerText = `${now} / ${this.max}`;
    if (errorText) {
      this.captureResult.innerText += errorText;
    }
  }

  finish() {
    this.captureResult.innerText += '終了しました';
  }
}