const { remote, ipcRenderer } = require('electron');
const ipc = require('electron-better-ipc');
const contextMenu = require('./renderer/contextMenu');
const theme = require('./renderer/theme');
const quill = require('./renderer/quill');
const editor = require('./renderer/editor');
const sidebar = require('./renderer/sidebar');
const footer = require('./renderer/footer');
const store = require('./renderer/store');
const find = require('./renderer/find');
const go = require('./renderer/goto');
const spellcheck = require('./renderer/spellcheck');
const tts = require('./renderer/tts');
const voiceassist = require('./renderer/voiceassist');

const { app, dialog } = remote;

// Maintain an object with these modules
// for easy ipcRenderer access without eval()
const modules = {
  contextMenu,
  theme,
  quill,
  editor,
  sidebar,
  footer,
  store,
  find,
  go,
  spellcheck,
  tts,
  voiceassist,
};

// Initialize the store with the window's project object
const { path } = remote.getCurrentWindow();
store.init(path);

// Spellcheck in texteditor
spellcheck.init();

// Disable file drop redirect
require('electron-disable-file-drop');

// Catch unhandled promise rejections
require('electron-unhandled')();


// Init all the modules
theme.init();
quill.init();
editor.init();
sidebar.init();
contextMenu.init();
footer.init();
tts.init();

ipcRenderer.on('message', (e, d) => {
  const { method, module, parameters } = d;
  modules[module][method](parameters);
});

// Save editor contents
ipc.answerMain('save', async () => {
  editor.save();
  return true;
});

