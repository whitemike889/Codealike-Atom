'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import { Codealike } from 'codealike-core';

export default {
  config: {
    token: {
      "title": "User Token",
      "description": "Please, configure your user token to start using Codealike.",
      "type": "string",
      "default": ""
    }
  },

  initialize(state) {
    Codealike.initialize('atom');
  },

  configureCodealikeAndStartTracking() {

    // verify if there is a loaded folder in workspace
    if (atom.project.rootDirectories.length) {
      // then ensure codealike configuration exists
      // and start tracking
      Codealike
        .configure(atom.project.rootDirectories["0"].lowerCasePath)
        .then(
          (configuration) => {
            // calculate when workspace started loading
            let currentDate = new Date();
            let startupDurationInMs = atom.getWindowLoadTime();
            currentDate.setMilliseconds(currentDate.getMilliseconds()-startupDurationInMs);

            // start tracking project
            Codealike.startTracking(configuration, currentDate);
          }
        );
    }
  },

  activate(state) {
    let that = this;

    // if another path is loaded, reconfigure codealike instance
    atom.project.onDidChangePaths((path) => {
      that.configureCodealikeAndStartTracking();
    })

    // check if codealike token is configured at start-up
    let token = atom.config.get('codealike-atom.token');
    if (token) {
      // try to connect
      Codealike.connect(token).then(
        (result) => {
          atom.notifications.addSuccess("Codealike is connected.");
          that.configureCodealikeAndStartTracking();
        },
        (error) => {
          atom.notifications.addError("Codealike couldn't connect with provided token. Please review it in the Codealike-Atom plugin settings.");
        }
      );
    }

    // verify codealike token changes to check if connect or disconnect
    // are required to be done
    atom.config.onDidChange('codealike-atom.token', ({newValue, oldValue, keyPath}) => {
      if (newValue != oldValue) {
        if (newValue === '') {
          // disconnect
          Codealike.disconnect();
          atom.notifications.addInfo("Codealike is disconnected.");
        }
        else {
          // try to connect
          Codealike.connect(newValue).then(
            (result) => {
              atom.notifications.addSuccess("Codealike is connected.");
              that.configureCodealikeAndStartTracking();
            },
            (error) => {
              Codealike.disconnect();
              atom.notifications.addError("Codealike couldn't connect with provided token. Please review it in the Codealike-Atom plugin settings.");
            }
          );
        }
      }
    });

    atom.workspace.observeTextEditors((editor) => {
      editor.onDidChangeCursorPosition((ev) => {
        // if text was changed the event
        // was already handled by onDidChange
        if (ev.textChanged)
          return;

        var context = { };
        if (editor = atom.workspace.getActiveTextEditor()) {
          if (file = editor.getBuffer().file) {
            context.file = file.path;
          }
          if (editor.cursors.length > 0) {
            context.line = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
          }
        }
        Codealike.trackFocusEvent(context);
      });

      editor.onDidChange((ev) => {
        var context = { };
        if (editor = atom.workspace.getActiveTextEditor()) {
          if (file = editor.getBuffer().file) {
            context.file = file.path;
          }
          if (editor.cursors.length > 0) {
            context.line = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
          }
        }
        Codealike.trackCodingEvent(context);
      });
    });
  },

  deactivate() {
    Codealike.dispose();
  },

  serialize() {
    return {
        version: 1.0
    };
  },
};
