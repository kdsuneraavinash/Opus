const { read } = require('./tts');
const store = require('./store');


function toggle() {
  const check = !store.get('voice-assist', false);
  store.set('voice-assist', check);
  if (check) {
    read('Turned on voice assist');
  } else {
    read('Turned off voice assist');
  }
}

module.exports = {
  toggle,
};
