'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import { Codealike } from '@codealike/codealike-core';
import smalltalk from 'smalltalk';

const AtomCodealikePlugin = {
  subscriptions: null,

  initialize(state) {
  },

  tryConnect() {
    // if user token configuration found, connect!
    if (Codealike.hasUserToken()) {
        // try to connect
        Codealike.connect()
                .then(
                    function() {
                        atom.notifications.addSuccess("Codealike is connected.");
                        AtomCodealikePlugin.startTrackingProject();
                    },
                    function() {
                        atom.notifications.addWarning("Codealike is not connected. Please configure your token to start using Codealike.");
                        AtomCodealikePlugin.stopTrackingProject();
                    }
                );
    }
    else {
        atom.notifications.addWarning("Codealike is not connected. Please configure your token to start using Codealike.");
    }
  },

  askForCredentials() {
    smalltalk.prompt("Codealike API Token", "Enter here your Codealike API token, or clean it to disconnect", Codealike.getUserToken() || '')
    .then(
      function(token) {
        // set user token configuration
        Codealike.setUserToken(token);

        // try to connect
        if (token) {
            Codealike.connect()
                .then(
                    function() {
                      atom.notifications.addSuccess("Codealike is connected.");
                      AtomCodealikePlugin.startTrackingProject();
                    },
                    function() {
                      atom.notifications.addWarning("Codealike cannot connect");
                      AtomCodealikePlugin.stopTrackingProject();
                    }
                );
        }
        else {
            AtomCodealikePlugin.stopTrackingProject();
            Codealike.disconnect();
            atom.notifications.addInfo("Codealike is disconnected");
        }
      },
      function() {
        // if cancel was pressed, do nothing
      }
    );
  },

  stopTrackingProject() {
      Codealike.stopTracking();
  },

  startTrackingProject() {
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
    // initialize plugin for current client and version
    Codealike.initialize('atom', '0.1.2');

    // try to connect to codealike and start tracking
    AtomCodealikePlugin.tryConnect();

    // if another path is loaded, reconfigure codealike instance
    atom.project.onDidChangePaths((path) => {
      AtomCodealikePlugin.startTracking();
    })

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'codealike:connect': () => AtomCodealikePlugin.askForCredentials()
    }));

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
    this.subscriptions.dispose();

    Codealike.dispose();
  },

  serialize() {
    return {
    };
  },
};

export default AtomCodealikePlugin;
