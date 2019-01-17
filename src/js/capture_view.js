import ProgressView from './progress_view';

export default class CaptureView {
  constructor({ captureResult, captureProgressContainer, originNode }) {
    this.captureResult = captureResult;
    this.captureProgressContainer = captureProgressContainer;
    this.originNode = originNode;
    this.progressViews = {};
  }

  resetView() {
    this.captureResult.innerText = '';
    this.captureProgressContainer.innerHTML = '';
    this.progressViews = {};
  }

  createProgressView(id, length) {
    const progressView = new ProgressView(length, this.originNode.cloneNode(true));
    this.captureProgressContainer.appendChild(progressView.getView());
    this.progressViews[id] = progressView;
  }

  updateView(id, count, errorText) {
    this.progressViews[id].updateView(count);

    if (errorText) {
      this.captureResult.innerText += errorText;
    }
  }

  stopped(id) {
    return this.progressViews[id].stopped();
  }
}