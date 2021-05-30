const store = require('./store');
const { read } = require('./tts');

/**
 * Initialize the body with the appropriate class.
 */

function init() {
  let isDark = false;

  if (store.hasWithoutPath('dark')) {
    isDark = store.getWithoutPath('dark');
  }

  if (isDark) {
    document.body.classList.add('dark');
  }
}

/**
 * Toggle the body classList and update the store.
 */

function toggle() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  store.setWithoutPath('dark', isDark);
  if (isDark) {
    read('Applied dark theme');
  } else {
    read('Applied light theme');
  }
}

module.exports = {
  init,
  toggle,
};
