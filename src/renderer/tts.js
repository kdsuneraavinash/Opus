const quill = require('./quill');
const { exec } = require('child_process');
const os = require('os');


const ttsButton = document.querySelector('.tts-button');

let readingAloud = false;
let readerPID = -1;

async function readApi(text) {
  text = text.replace('\'', ' ');
  text = text.replace('"', ' ');

  let command;
  switch (os.platform()) {
    case 'win32':
      command = `PowerShell -Command "Add-Type –AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${text}');"`;
      break;
    case 'darwin':
      command = `say "${text}"`;
      break;

    case 'linux':
      command = `spd-say "${text}"`;
      break;

    default:
      throw new Error('OS not supported for text-to-speech feature.');
  }
  return new Promise((resolve) => {
    readerPID = exec(command, (err, stdout, stderr) => {
      resolve();
    }).pid;
  });
}

module.exports = {
  init() {
    ttsButton.addEventListener('click', () => {
      if (readingAloud) {
        this.stop();
      } else {
        this.read(quill.getText());
      }
    });
    this.setState(false);
  },

  isReading() {
    return readingAloud;
  },

  setState(reading) {
    readingAloud = reading;
    if (reading) {
      ttsButton.innerHTML = '🔈 STOP';
    } else {
      readerPID = -1;
      ttsButton.innerHTML = '🔊  TTS';
    }
  },

  async read(text) {
    if (this.isReading()) {
      this.stop();
      this.setState(false);
    } else {
      this.setState(true);
      await readApi(text);
      this.setState(false);
    }
  },

  stop() {
    if (readerPID == -1) {
      this.setState(false);
    } else {
      try {
        process.kill(readerPID);
      } catch (e) {
        console.warn(e);
      }
    }
  },
};
