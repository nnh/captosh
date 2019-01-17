export default class ProgressView {
  constructor(length, node) {
    this.length = length;
    this.node = node;

    this.progressBar = this.node.getElementsByClassName('progress-bar')[0];
    this.progressBar.setAttribute('aria-valuemax', this.length);

    this.progressNum = this.node.getElementsByClassName('progress-num')[0];
    this.progressNum.innerText = `0 / ${this.length}`;

    this.progressStatus = this.node.getElementsByClassName('progress-status')[0];
    this.progressStatus.innerText = '待機中';

    this.stopButton = this.node.getElementsByClassName('capture-stop-button')[0];
    this.stopButton.addEventListener('click', () => {
      if (!this.stopButton.disabled) {
        this.progressStatus.innerText = '中止';
        this.buttonDisabled();
      }
    });
  }

  updateView(count) {
    this.progressBar.setAttribute('aria-valuenow', count);
    this.progressBar.style['width'] = `${count * 100 / this.length}%`;

    this.progressNum.innerText = `${count} / ${this.length}`;

    if (this.progressStatus.innerText === '待機中') {
      this.progressStatus.innerText = '実行中';
    }

    if (count === this.length) {
      this.progressStatus.innerText = '終了';
      this.buttonDisabled();
    }
  }

  getView() {
    return this.node;
  }

  stopped() {
    return this.progressStatus.innerText === '中止';
  }

  buttonDisabled() {
    this.stopButton.classList.remove('btn-danger');
    this.stopButton.classList.add('btn-warning');
    this.stopButton.disabled = true;
  }
}