const { webFrame, remote } = require('electron');
const { read } = require('./tts');

const spellchecker = require('spellchecker');
const osLocale = require('os-locale');
const spellcheckerContextMenu = require('./spellcheckMenu');
const store = require('./store');

function setSpellcheck(val) {
  const view = document.querySelector('main > div.editor.ql-container.ql-snow > div.ql-editor');
  view.setAttribute('contenteditable', false);
  view.setAttribute('spellcheck', val);
  view.setAttribute('contenteditable', true);
}

function init() {
  const check = store.get('spellcheck', true);
  setSpellcheck(check);

  const locale = osLocale.sync().replace('-', '_');
  if (!process.env.LANG) {
    process.env.LANG = locale;
  }

  const ENGLISH_SKIP_WORDS = [
    'ain',
    'couldn',
    'didn',
    'doesn',
    'hadn',
    'hasn',
    'mightn',
    'mustn',
    'needn',
    'oughtn',
    'shan',
    'shouldn',
    'wasn',
    'weren',
    'wouldn',
  ];

  const simpleChecker = {
    spellCheck: text => !simpleChecker.isMisspelled(text),
    getSuggestions: text => spellchecker.getCorrectionsForMisspelling(text),
    isMisspelled: (text) => {
      const misspelled = spellchecker.isMisspelled(text);

      if (!misspelled) {
        return false;
      }

      if (ENGLISH_SKIP_WORDS.includes(text)) {
        return false;
      }

      return true;
    },
    add: (text) => {
      spellchecker.add(text);
    },
  };

  window.spellChecker = simpleChecker;

  webFrame.setSpellCheckProvider(
    'en-US',
    true,
    simpleChecker,
  );

  window.addEventListener('contextmenu', (e) => {
    // Do not show spellcheck context menu
    // if right click is not within editor
    if (!e.target.closest('div[contenteditable=true]')) {
      return;
    }

    if (store.get('spellcheck', true)) {
      const selectedText = window.getSelection().toString();

      // If selection is empty, no menu
      if (!selectedText || selectedText === '' || selectedText.length === 1) {
        return;
      }

      const isMisspelled = selectedText && simpleChecker.isMisspelled(selectedText);
      const suggestions = isMisspelled && simpleChecker.getSuggestions(selectedText).slice(0, 5);
      const menu = spellcheckerContextMenu({
        word: selectedText,
        isMisspelled,
        suggestions,
      });

      setTimeout(() => {
        menu.popup(remote.getCurrentWindow());
      }, 30);
    } else {
      const menu = spellcheckerContextMenu();
      setTimeout(() => {
        menu.popup(remote.getCurrentWindow());
      }, 30);
    }
  });
}

function toggle() {
  const check = !store.get('spellcheck', true);
  store.set('spellcheck', check);
  setSpellcheck(check);
  if (check) {
    read('Turned on spell checker');
  } else {
    read('Turned off spell checker');
  }
}

module.exports = {
  init,
  toggle,
};
