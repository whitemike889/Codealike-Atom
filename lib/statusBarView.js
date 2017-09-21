'use babel';
import { Disposable } from 'atom';

class CodealikeStatusBarView extends HTMLElement {
  init() {
    this.classList.add('inline-block');

    this.link = document.createElement('a');
    this.link.classList.add('codealike-status', 'inline-block');
    this.appendChild(this.link);

    this.text = document.createElement('span');
    this.text.classList.add('inline-block');
    this.link.appendChild(this.text);

    this.handleClick();
  }

  destroy() {
    this.clickSubscription.dispose();
  }

  handleClick() {
    var clickHandler;
    clickHandler = () => {
      atom.commands.dispatch(this.link, 'codealike:connect');
    }

    this.link.addEventListener('click', clickHandler);
    return this.clickSubscription = new Disposable(() => {
      return this.link.removeEventListener('click', clickHandler);
    });
  }

  updateMessage(message, type) {
    this.text.textContent = message;
  }
};

export default document.registerElement('codealike-status-bar-item', {
  prototype: CodealikeStatusBarView.prototype,
  extends: 'div'
});
