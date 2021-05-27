const FS = require('fs');
const PATH = require('path');
const Delta = require('quill-delta');
const Quill = require('quill');
const { remote } = require('electron');


const constants = {
  DIRECTORY: 'directory',
  FILE: 'file',
};

const notificationStore = (function store() {
  let notifications = []; // Private Variable

  const publicInterface = {};

  publicInterface.add = function add(n) {
    notifications.push(n);
  };

  publicInterface.getAll = function getAll() {
    console.log(notifications.join('\n'));
    return notifications.join('\n');
  };

  publicInterface.clear = function clear() {
    notifications = [];
  };

  return publicInterface;
}());

function safeReadDirSync(path) {
  let dirData = {};
  try {
    dirData = FS.readdirSync(path);
  } catch (ex) {
    if (ex.code === 'EACCES') { return null; }
    throw ex;
  }
  return dirData;
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  regExp
 * @return {Boolean}
 */
function isRegExp(regExp) {
  return typeof regExp === 'object' && regExp.constructor === RegExp;
}

function directoryTree(path, options, onEachFile) {
  const name = PATH.basename(path);
  const item = { path, name };
  let stats;

  try { stats = FS.statSync(path); } catch (e) { return null; }

  // Skip if it matches the exclude regex
  if (options && options.exclude) {
    const excludes = isRegExp(options.exclude) ? [options.exclude] : options.exclude;
    if (excludes.some(exclusion => exclusion.test(path))) {
      return null;
    }
  }

  if (stats.isFile()) {
    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (options && options.extensions && !options.extensions.test(ext)) { return null; }

    try {
      // Check for valid JSON
      const contents = FS.readFileSync(path).toString();
      const delta = new Delta(JSON.parse(contents));
      const quill = new Quill('.hidden-editor');
      quill.setContents(delta, 'silent');
    } catch (error) {
      console.warn(`${path} is corrupted`);
      notificationStore.add(name);
      return null;
    }

    item.extension = ext;
    item.type = constants.FILE;
    if (onEachFile) {
      onEachFile(item, PATH);
    }
  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(path);
    if (dirData === null) return null;

    item.children = dirData
      .map(child => directoryTree(
        PATH.join(path, child),
        { ...options, callFromRootDir: false },
        onEachFile,
      ))
      .filter(e => !!e)
      .sort((a, b) => {
        if (a.type === b.type) { if (a.path < b.path) { return -1; } return 1; }
        if (a.type === constants.DIRECTORY) { return -1; } return 1;
      });

    item.type = constants.DIRECTORY;
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  if (options.fileCorruptedNotification && options.callFromRootDir) {
    const notification = new remote.Notification({
      title: 'Opus Notification',
      subtitle: 'One or more .note files in the selected directory are corrupted.',
      body: `One or more .note files in the selected directory are corrupted.\n${notificationStore.getAll()}`,
    });
    notification.show();
    notificationStore.clear();
  }
  return item;
}

module.exports = directoryTree;
