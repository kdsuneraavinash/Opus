const settings = require('electron-settings');

const Store = {
  init: (p) => {
    this.path = p;
  },

  get: (key, defaultValue) => {
    if (!this.path) throw new Error('No store path defined.');
    return settings.get(`windows.${this.path}.${key}`, defaultValue);
  },

  set: (key, value) => {
    if (!this.path) throw new Error('No store path defined.');
    return settings.set(`windows.${this.path}.${key}`, value);
  },

  has: (key) => {
    if (!this.path) throw new Error('No store path defined.');
    return settings.has(`windows.${this.path}.${key}`);
  },

  getWithoutPath: key => settings.get(key),

  setWithoutPath: (key, value) => settings.set(key, value),

  hasWithoutPath: key => settings.has(key),
};

Object.freeze(Store);

module.exports = Store;
