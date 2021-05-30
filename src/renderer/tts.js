const quill = require('./quill');
const { exec } = require('child_process');
const os = require('os');


const ttsButton = document.querySelector('.tts-button');

let readingAloud = false;
let readerPID = -1;

async function readApi(text) {
  text = text.replace(/[^0-9A-Z]+/gi, ' ');

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
      console.warn(stderr);
    }).pid;
  });
}


function isReading() {
  return readingAloud;
}

function setState(reading) {
  readingAloud = reading;
  if (reading) {
    ttsButton.innerHTML = '🔈 STOP';
  } else {
    readerPID = -1;
    ttsButton.innerHTML = '🔊  TTS';
  }
}


function stop() {
  if (readerPID === -1) {
    setState(false);
  } else {
    try {
      process.kill(readerPID);
    } catch (e) {
      console.warn(e);
    }
  }
}

async function read(text) {
  if (isReading()) {
    stop();
    setState(false);
  } else {
    setState(true);
    await readApi(text);
    setState(false);
  }
}

function init() {
  ttsButton.addEventListener('click', () => {
    if (readingAloud) {
      stop();
    } else {
      read(quill.getText());
    }
  });
  setState(false);
}

module.exports = {
  init,
  isReading,
  setState,
  read,
  stop,
};
