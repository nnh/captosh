export default class CaptureEventViews {
  constructor() {
    this.errorText = '';
    this.max = 0;
  }

  setViews({ captureProgress, captureResult, progressBar }) {
    this.captureProgress = captureProgress;
    this.captureResult = captureResult;
    this.progressBar = progressBar;
  }

  resetViews() {
    this.captureProgress.innerHTML = '';
    this.captureResult.innerHTML = '';
    this.progressBar.style['width'] = '0%';
  }

  initializeViews(length) {
    this.errorText = '';
    this.max = length;
    this.progressBar.setAttribute('aria-valuenow', 0);
    this.progressBar.setAttribute('aria-valuemax', this.max);
    this.captureProgress.innerText = `0 / ${this.max}`;
  }

  updateViews(now, result) {
    this.progressBar.setAttribute('aria-valuenow', now);
    this.progressBar.style['width'] = `${(now) * 100 / this.max}%`;
    this.captureProgress.innerText = `${now} / ${this.max}`;
    if (result && result.errorText) {
      this.errorText += result.errorText;
    }
  }

  finish() {
    this.captureResult.innerText = this.errorText.length ? this.errorText : '終了しました';
  }
}