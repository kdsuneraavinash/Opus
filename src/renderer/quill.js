const Quill = require('quill');
const { read, onDocumentRead } = require('./tts');

// Define custom inline blot for find highlighting
const Inline = Quill.import('blots/inline');
class HighlightBlot extends Inline {}
HighlightBlot.blotName = 'highlight';
HighlightBlot.className = 'highlight';
HighlightBlot.tagName = 'hl';

// Custom embedded block blot for line separator
const Block = Quill.import('blots/block');
class HrBlot extends Block {}
HrBlot.blotName = 'separator';
HrBlot.tagName = 'hr';

// Register the blots
Quill.register(HighlightBlot);
Quill.register(HrBlot);

// Initialize the editor
const quill = new Quill('.editor', {
  debug: 'error',
  theme: 'snow',
  modules: {
    history: {
      userOnly: true,
    },
  },
});
const ttsButton = document.querySelector('.tts-button');


module.exports = {
  init() {
    // Automatically focus the editor
    quill.focus();
    ttsButton.addEventListener('click', () => {
      onDocumentRead(this.getText());
    });
  },
  quill,
  norm() {
    quill.format('header', false, Quill.sources.USER);
    read('Applied normal text formatting');
  },
  h1() {
    quill.format('header', '1', Quill.sources.USER);
    read('Applied heading 1');
  },
  h2() {
    quill.format('header', '2', Quill.sources.USER);
    read('Applied heading 2');
  },
  h3() {
    quill.format('header', '3', Quill.sources.USER);
    read('Applied heading 3');
  },
  h4() {
    quill.format('header', '4', Quill.sources.USER);
    read('Applied heading 4');
  },
  h5() {
    quill.format('header', '5', Quill.sources.USER);
    read('Applied heading 5');
  },
  h6() {
    quill.format('header', '6', Quill.sources.USER);
    read('Applied heading 6');
  },
  bold() {
    quill.format('bold', !quill.getFormat().bold, Quill.sources.USER);
    read('Toggled bold text');
  },
  italic() {
    quill.format('italic', !quill.getFormat().italic, Quill.sources.USER);
    read('Toggled italic text');
  },
  underline() {
    quill.format('underline', !quill.getFormat().underline, Quill.sources.USER);
    read('Toggled underline text');
  },
  strikethrough() {
    quill.format('strike', !quill.getFormat().strike, Quill.sources.USER);
    read('Toggled strikerhtough text');
  },
  list() {
    quill.format('list', 'bullet', Quill.sources.USER);
    read('Created unordered list');
  },
  orderedList() {
    quill.format('list', 'ordered', Quill.sources.USER);
    read('Created ordered list');
  },
  quote() {
    quill.format('blockquote', !quill.getFormat().blockquote, Quill.sources.USER);
    read('Toggled quoted text');
  },
  code() {
    quill.format('code', !quill.getFormat().code, Quill.sources.USER);
    read('Toggled inline code');
  },
  codeblock() {
    quill.format('code-block', !quill.getFormat()['code-block'], Quill.sources.USER);
    read('Toggled code block');
  },
  superscript() {
    const result = quill.getFormat().script;
    if (result === 'super') {
      quill.format('script', null, Quill.sources.USER);
      read('Removed superscript');
    } else {
      quill.format('script', 'super', Quill.sources.USER);
      read('Applied superscript');
    }
  },
  subscript() {
    const result = quill.getFormat().script;
    if (result === 'sub') {
      quill.format('script', null, Quill.sources.USER);
      read('Removed subscript');
    } else {
      quill.format('script', 'sub', Quill.sources.USER);
      read('Applied subscript');
    }
  },
  indent() {
    quill.format('indent', '+1', Quill.sources.USER);
    read('Increased indentation');
  },
  outdent() {
    quill.format('indent', '-1', Quill.sources.USER);
    read('Decreased indentation');
  },
  separator() {
    const range = quill.getSelection();
    quill.insertEmbed(range.index, 'separator', true, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
    read('Added seperator');
  },
  escape() {
    const format = quill.getFormat();
    Object.keys(format).forEach((key) => {
      quill.format(key, false, Quill.sources.USER);
    });
  },
  clear() {
    quill.removeFormat(quill.getSelection(), Quill.sources.USER);
  },
  getText() {
    const range = quill.getSelection();
    if (range && range.length != 0) {
      return quill.getText(range.index, range.length);
    }
    return quill.getText();
  },
};
