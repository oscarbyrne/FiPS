// A text field that shows its editable text while you type and a formatted
// version when you leave it ("16,4" becomes "16 → 4"). Works on a plain
// <input> or on a contenteditable element (needed for the <sub> markup).
//
// createField({ el, fix, parse, toText, display, onEnter }) returns an object
// whose `.value` is the parsed list, read from what has been typed.
//
// Options:
//   fix(text)      rewrites the text as the user types (drops or swaps characters;
//                  it must work character by character, see parse.js)
//   parse(text)    editable text -> list
//   toText(list)   list -> editable text
//   display(list)  what to show when the field isn't focused: a string, or for a
//                  contenteditable element a string or an array of DOM nodes.
//                  Defaults to the editable text.
//   onEnter()      contenteditable only: called when Enter is pressed (an <input>
//                  already submits its form on Enter)

// ---- how to read and write each kind of element ----

const inputView = el => ({
  getText: () => el.value,
  setText: text => {
    el.value = text;
  },
  setDisplay: shown => {
    el.value = shown;
  },
  getCaret: () => el.selectionStart,
  setCaret: offset => el.setSelectionRange(offset, offset),
});

const editableView = el => ({
  getText: () => el.textContent,
  setText: text => {
    el.textContent = text;
  },
  setDisplay: shown => {
    if (typeof shown === 'string') el.textContent = shown;
    else el.replaceChildren(...shown);
  },

  // Character offset of the caret inside the element
  getCaret: () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return el.textContent.length;
    const range = sel.getRangeAt(0).cloneRange();
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  },

  setCaret: offset => {
    const node = el.firstChild;
    const range = document.createRange();
    if (node) range.setStart(node, Math.min(offset, node.textContent.length));
    else range.setStart(el, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  },
});

// ---- the field ----

export function createField({
  el,
  fix,
  parse,
  toText,
  display = toText,
  onEnter,
}) {
  const isInput = el.tagName === 'INPUT';
  const view = isInput ? inputView(el) : editableView(el);

  let raw = ''; // the editable text, kept separately because the element shows formatted text when blurred

  // As the user types: fix the text, keeping the caret where it was
  el.addEventListener('input', () => {
    const text = view.getText();
    const fixed = fix(text);
    if (fixed !== text) {
      const caret = fix(text.slice(0, view.getCaret())).length;
      view.setText(fixed);
      view.setCaret(caret);
    }
    raw = fixed;
  });

  // Click in: swap the formatted display for the editable text
  el.addEventListener('focus', () => {
    view.setText(raw);
    view.setCaret(raw.length);
  });

  // Click out: tidy the text and show the formatted version
  el.addEventListener('blur', () => {
    const list = parse(raw);
    raw = toText(list);
    view.setDisplay(display(list));
  });

  if (!isInput) {
    // Enter submits instead of inserting a line break
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter?.();
      }
    });

    // Paste as plain text only
    el.addEventListener('paste', e => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain').replace(/\r?\n/g, ',');
      document.execCommand('insertText', false, text);
    });
  }

  return {
    get value() {
      return parse(raw);
    },
  };
}
