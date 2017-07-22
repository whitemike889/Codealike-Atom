'use babel';

//import CodealikeSettingsView from './codealike-settings-view';
import { CompositeDisposable, Disposable } from 'atom';
import { Codealike } from 'codealike-core';

export default {
  //settings: null,
  //codealikeAtomView: null,
  //modalPanel: null,
  //subscriptions: null,
  projectContext: null,

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

  configureCodealike() {
    if (atom.project.rootDirectories.length) {
      Codealike.configure(atom.project.rootDirectories["0"].lowerCasePath);
    }
  },

  activate(state) {
    //this.codealikeAtomView = new CodealikeSettingsView(state.codealikeAtomViewState);
    //this.modalPanel = atom.workspace.addModalPanel({
    //  item: this.codealikeAtomView.getElement(),
    //  visible: false
    //});
    let that = this;

    atom.project.onDidChangePaths((path) => {
      that.configureCodealike();
    })

    // check if codealike token is configured at start-up
    let token = atom.config.get('codealike-atom.token');
    if (token) {
      // try to connect
      Codealike.connect(token).then(
        (result) => {
          atom.notifications.addSuccess("Codealike is connected.");
          that.configureCodealike();
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
              that.configureCodealike();
            },
            (error) => {
              Codealike.disconnect();
              atom.notifications.addError("Codealike couldn't connect with provided token. Please review it in the Codealike-Atom plugin settings.");
            }
          );
        }
      }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    /*this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://codealike-settings-view') {
          return new CodealikeSettingsView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'codealike-atom:settings': () => this.showSettings()
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof CodealikeSettingsView) {
            item.destroy();
          }
        });
      })
    );*/

    // Register command that toggles this view
    //this.subscriptions.add(atom.commands.add('atom-workspace', {
    //  'codealike-atom:settings': () => this.showSettings()
    //}));

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
    //this.modalPanel.destroy();
    //this.codealikeAtomView.destroy();

    //this.subscriptions.dispose();
    Codealike.dispose();
  },

  serialize() {
    return {
        version: 1.0
    };
  },

  //showSettings() {
  //  console.log('Codealike toggle!');
  //  atom.workspace.toggle('atom://codealike-settings-view');
  //}
};
