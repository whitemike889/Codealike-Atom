'use babel';

import { Codealike } from 'codealike-core';

export default class CodealikeSettingsView {
  tokenInputEl = null

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('codealike-atom');

    // create ui
    const mainPanel = document.createElement('div')

    const header = document.createElement('h2');
    header.innerHTML = "Codealike Settings";

    // get constructed authentication panel
    const authPanel = this.getNotAuthenticatedPanel();

    // get constructed profile info panel
    const profilePanel = this.getProfilePanel();

    mainPanel.appendChild(header);
    mainPanel.appendChild(authPanel);
    mainPanel.appendChild(profilePanel);

    this.element.appendChild(mainPanel);

    this.refresh();
  }

  refresh() {
    let token = atom.config.get('codealike.userToken');

    if (token) {
      if (this.tokenInputEl)
        this.tokenInputEl.value = token;
    }
    else {

    }
  }

  getNotAuthenticatedPanel() {
    const container = document.createElement('div');
    container.id = 'authenticationPanel';

    const labelContainer = document.createElement('div');
    const label = document.createElement('b');
    label.innerHTML = "Token:";
    labelContainer.appendChild(label);

    const inputContainer = document.createElement('div');
    this.tokenInputEl = document.createElement('input');
    this.tokenInputEl.className = 'native-key-bindings codealike-token-input';
    this.tokenInputEl.id = 'token';
    inputContainer.appendChild(this.tokenInputEl);

    const buttonContainer = document.createElement('div');
    const button = document.createElement('button');
    button.className = 'btn';
    button.innerHTML = "Connect";
    button.addEventListener("click", this.tryConnect);
    buttonContainer.appendChild(button);

    container.appendChild(labelContainer);
    container.appendChild(inputContainer);
    container.appendChild(buttonContainer);

    return container;
  }

  createLabelPanel(labelId, labelText) {
    const container = document.createElement('div');

    const label = document.createElement('b');
    label.innerHTML = labelText + ":";
    container.appendChild(label);

    const labelPlaceHolder = document.createElement('div');
    labelPlaceHolder.id = labelId;
    labelPlaceHolder.innerHTML = "empty";
    container.appendChild(labelPlaceHolder);

    return container;
  }

  getProfilePanel() {
    const container = document.createElement('div');
    container.id = 'authenticationPanel';

    container.appendChild(this.createLabelPanel('fullName', 'Full Name'));

    const buttonContainer = document.createElement('div');
    const button = document.createElement('button');
    button.className = 'btn';
    button.innerHTML = "Disconnect";
    button.addEventListener("click", this.disconnect);
    buttonContainer.appendChild(button);

    container.appendChild(buttonContainer);

    return container;
  }

  tryConnect() {
    var userToken = document.getElementById("token").value;
    alert('Authenticating ' + userToken + '!');

    Codealike.connect(userToken).then(
      (result) => {
        atom.config.set('codealike.userToken', userToken);
        this.loadProfile();
      },
      (error) => {
        this.showError();
      }
    );
  }

  disconnect() {
    Codealike.disconnect();
  }

  showError() {

  }

  loadProfile() {
    /*
    {
    	"Identity": "weak-9396226521",
    	"FullName": null,
    	"DisplayName": "Daniel Iglesias",
    	"Address": null,
    	"State": null,
    	"Country": null,
    	"AvatarUri": "https://www.gravatar.com/avatar/e9cf5a5d97cff1cd3f5d1e58f5a10a84?d=https://www.gravatar.com/avatar/816426e76a556172add5b2143548d8e3",
    	"Email": "diglesias17@hotmail.com",
    	"level": "debug",
    	"message": "Get profile",
    	"timestamp": "2017-07-21T13:18:17.951Z"
    }
    */
    Codealike.getProfile().then(
      (result) => {
        document.getElementById('fullName').innerHTML = result.DisplayName;
      },
      (error) => {
        showError();
      }
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
