'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import { Codealike } from '@codealike/codealike-core';
import smalltalk from 'smalltalk';
import CodealikeStatusBarView from './statusBarView';

const AtomCodealikePlugin = {
  subscriptions: null,
  statusBar: null,
  statusBarView: null,

  initialize() {
    // initialize status bar view
    this.statusBarView = new CodealikeStatusBarView();
    this.statusBarView.init();
    this.statusBarView.updateMessage("Codealike is initializing...", "info");
  },

  tryConnect() {

    // try to connect
    Codealike.connect()
            .then(
                function() {
                    AtomCodealikePlugin.startTrackingProject();
                },
                function() {
                    AtomCodealikePlugin.stopTrackingProject();
                }
            );

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
                      AtomCodealikePlugin.startTrackingProject();
                    },
                    function() {
                      AtomCodealikePlugin.stopTrackingProject();
                    }
                );
        }
        else {
            AtomCodealikePlugin.stopTrackingProject();
            Codealike.disconnect();
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
    let paths = atom.project.getPaths();

    // verify if there is a loaded folder in workspace
    if (paths.length) {
      // then ensure codealike configuration exists
      // and start tracking
      let rootPath = paths[0];

      Codealike
        .configure(rootPath)
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
    Codealike.initialize('atom', '0.0.9');

    Codealike.registerStateSubscriber((state) => {
      if (state.isTracking) {
        if (state.networkStatus === 'OnLine') {
          AtomCodealikePlugin.statusBarView.updateMessage("Codealike is tracking on-line", "success");
        }
        else {
          AtomCodealikePlugin.statusBarView.updateMessage("Codealike is tracking off-line", "warning");
        }
      }
      else {
          AtomCodealikePlugin.statusBarView.updateMessage("Click here to configure Codealike", "info");
      }
    });

    // try to connect to codealike and start tracking
    AtomCodealikePlugin.tryConnect();

    // if another path is loaded, reconfigure codealike instance
    atom.project.onDidChangePaths((path) => {
      AtomCodealikePlugin.startTrackingProject();
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
    Codealike.dispose();

    this.subscriptions.dispose();
    this.statusBarView.destroy();
    this.statusBar.destroy();
  },

  consumeStatusBar(sb) {
    this.statusBar = sb.addLeftTile({ item: this.statusBarView });
  }
};

export default AtomCodealikePlugin;
