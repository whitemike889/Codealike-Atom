'use babel';

//import CodealikeAtomView from './codealike-atom-view';
import { CompositeDisposable } from 'atom';
import { Codealike } from 'codealike-core';

export default {

  //codealikeAtomView: null,
  //modalPanel: null,
  subscriptions: null,

  initialize() {
    Codealike.initialize();
  },

  activate(state) {
    Codealike.startTracking();

    //this.codealikeAtomView = new CodealikeAtomView(state.codealikeAtomViewState);
    //this.modalPanel = atom.workspace.addModalPanel({
    //  item: this.codealikeAtomView.getElement(),
    //  visible: false
    //});

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'codealike-atom:toggle': () => this.toggle()
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
    //this.modalPanel.destroy();
    this.subscriptions.dispose();
    Codealike.dispose();
    //this.codealikeAtomView.destroy();
  },

  serialize() {
    return {
      codealikeAtomViewState: { }
    };
  },

  toggle() {
    console.log('Codealike toggle!');
  }
};
