export default class CaptureView {
  constructor({ captureProgress, captureResult, progressBar, stopButton }) {
    this.max = 0;
    this.isCapturing = false;
    this.captureProgress = captureProgress;
    this.captureResult = captureResult;
    this.progressBar = progressBar;
    this.stopButton = stopButton;
    this.stopButton.addEventListener('click', () => {
      if (this.isCapturing) {
        this.isCapturing = false;
        this.captureResult.innerText += '中止しました';
      }
    });
  }

  resetView() {
    this.captureProgress.innerHTML = '';
    this.captureResult.innerHTML = '';
    this.progressBar.style['width'] = '0%';
  }

  initializeView(length) {
    this.max = length;
    this.isCapturing = true;
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
    if (now === this.max) {
      this.isCapturing = false;
      this.captureResult.innerText += '終了しました';
    }
  }

  stopped() {
    return !this.isCapturing;
  }
}