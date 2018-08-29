const chokidar = require('chokidar');
const settings = require('electron-settings');
const TreeView = require('./bin/tree');
const Tree = require('./tree');
const editor = require('./editor');

const aside = document.querySelector('aside');
let tree;

module.exports = {
  init() {
    const activeProject = settings.get('project');

    // Determine whether to show aside or not on load
    if (settings.has('aside')) {
      const isHidden = settings.get('aside');
      if (isHidden) {
        aside.classList.add('hide');
      }
    }

    // Apply a saved width to the sidebar if one was saved
    if (settings.has('asideWidth')) {
      const width = settings.get('asideWidth');
      aside.style.flexBasis = width;
    }

    // Get the folder data
    if (settings.has('tree')) {
      tree = Tree.createTree(activeProject, settings.get('tree'));
    } else {
      tree = Tree.createTree(activeProject, null);
    }

    // Ensure the active prop on the active file
    if (settings.has('file')) {
      const file = settings.get('file');
      if (file && file !== '') { tree.find(file).active = true; }
    }

    // Setup the tree-view
    const treeView = new TreeView([tree.data], 'tree');

    // Watch the file system for changes
    const watcher = chokidar.watch(activeProject, {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    // Event listeners
    treeView.on('select', (e) => {
      const newPath = e.data.path;
      const oldPath = editor.get();

      const element = e.target.target.closest('.tree-leaf-content');

      // Open the file if it is not already active
      if (oldPath !== newPath) {
        const ret = editor.open(newPath);

        // New file was not opened
        if (!ret) { return; }

        // Remove active state from old file
        if (oldPath && oldPath !== '') { tree.find(oldPath).active = false; }

        // Apply active state to new file
        tree.find(newPath).active = true;

        // Remove active class from other things
        const elems = document.querySelectorAll('.active');
        if (elems && elems.length !== 0) {
          [].forEach.call(elems, (el) => {
            el.classList.remove('active');
          });
        }

        // Update CSS class
        element.classList.add('active');
      }

      module.exports.export();
    });

    treeView.on('expand', (e) => {
      const name = JSON.parse(e.target.getAttribute('data-item')).path;
      tree.open(name);
      module.exports.export();
    });

    treeView.on('collapse', (e) => {
      const name = JSON.parse(e.target.getAttribute('data-item')).path;
      tree.close(name);
      module.exports.export();
    });

    watcher.on('ready', () => {
      // Check if removed file is active in the editor
      watcher.on('unlink', (p) => {
        if (editor.get() === p) { editor.reset(); }
      });

      watcher.on('all', (() => {
        // Update the document object tree
        tree.reload(activeProject);

        // Update the DOM with new data (preserves open states)
        treeView.reload([tree.data], 'tree');
      }));

      watcher.on('error', (error) => {
        throw new Error(`Watcher error: ${error}`);
      });
    });
  },
  export() {
    // Save the tree state
    settings.set('tree', tree.getSettings());

    // Save the width of the sidebar
    if (aside.style.flexBasis) {
      settings.set('asideWidth', aside.style.flexBasis);
    } else {
      settings.set('asideWidth', 200);
    }
  },
  toggle() {
    aside.classList.toggle('hide');
    const isHidden = aside.classList.contains('hide');
    settings.set('aside', isHidden);
    console.log(settings.get('aside'));
  },
};
