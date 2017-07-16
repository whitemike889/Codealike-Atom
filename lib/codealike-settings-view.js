'use babel';

import { Codealike } from 'codealike-core';

export default class CodealikeSettingsView {

  constructor(serializedState) {
    let token = atom.config.get('codealike.userToken');

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('codealike-atom');

    // create ui
    const mainPanel = document.createElement('div')

    const header = document.createElement('h2');
    header.innerHTML = "Codealike Settings";

    const labelContainer = document.createElement('div');
    const label = document.createElement('b');
    label.innerHTML = "Token:";
    labelContainer.appendChild(label);

    const inputContainer = document.createElement('div');
    const input = document.createElement('input');
    input.className = 'native-key-bindings';
    input.id = 'token';
    input.value = token;
    inputContainer.appendChild(input);

    const button = document.createElement('button');
    button.className = 'btn';
    button.innerHTML = "Connect";
    button.addEventListener("click", this.tryConnect);
    inputContainer.appendChild(button);

    mainPanel.appendChild(header);
    mainPanel.appendChild(labelContainer);
    mainPanel.appendChild(inputContainer)

    this.element.appendChild(mainPanel);
  }

  tryConnect() {
    var value = document.getElementById("token").value;
    alert('Authenticating ' + value + '!');

    Codealike.authenticate(value).then(
      (result) => { console.log(result); alert('Authenticated!'); },
      (error) => { console.log(error); alert('Error!') }
    );
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  getTitle() {
    // Used by Atom for tab text
    return 'Codealike Settings';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://codealike-settings-view';
  }

  getDefaultLocation() {
      // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
      // Valid values are "left", "right", "bottom", and "center" (the default).
      return 'right';
    }

    getAllowedLocations() {
      // The locations into which the item can be moved.
      return ['left', 'right', 'bottom'];
    }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
