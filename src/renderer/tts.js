const quill = require("./quill");
const { exec } = require('child_process');

const ttsButton = document.querySelector('.tts-button');

var readingAloud = false;
var readerPID = -1;

async function readApi(text) {
    return new Promise(resolve => {
        readerPID = exec(`konsole --hold -e cowsay "${text}"`, (err, stdout, stderr) => {
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
            ttsButton.innerHTML = "🔈 STOP";
        } else {
            readerPID = -1;
            ttsButton.innerHTML = "🔊  TTS";
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
            }
        }
    }
};
