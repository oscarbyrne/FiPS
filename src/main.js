import { getKeys } from './fips.js';
import { KeyStore } from './key-store.js';
import {
  fixK, fixNumberList,
  parseConfig, parseK, parseM,
  numbersToText, kClassesToText,
} from './parse.js';
import { SoundAllocator } from './sound/sound-allocator.js';
import { ALL_SOUNDS } from './sound/sounds.js';
import { patternCode } from './sound/pattern.js';
import { play } from './sound/player.js';
import { renderKeysTable } from './ui/table.js';
import { createField } from './ui/fields.js';
import { kClassNodes } from './ui/kclass-view.js';
import { setupHotkeys } from './ui/hotkeys.js';

const form   = document.getElementById('f');
const hint   = document.getElementById('hint');
const output = document.getElementById('output');
const toast  = document.getElementById('toast');

const TOAST_MS = 1200; // how long the toast stays visible (the fade is in the CSS)
let toastTimeout;

// Show a short message at the bottom of the screen, then fade it out
function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), TOAST_MS);
}

// ---- the three fields ----

form.addEventListener('input', () => { hint.textContent = ''; }); // any edit clears the hint

const configField = createField({
  el: document.getElementById('nums'),
  fix: fixNumberList,
  parse: parseConfig,
  toText: numbersToText,
  display: list => list.join(' → '),
});

const mField = createField({
  el: document.getElementById('m'),
  fix: fixNumberList,
  parse: parseM,
  toText: numbersToText,
});

const kField = createField({
  el: document.getElementById('k'), // contenteditable, so the fractions can show <sub> markup
  fix: fixK,
  parse: parseK,
  toText: kClassesToText,
  display: kClassNodes,
  onEnter: () => form.requestSubmit(),
});

// ---- keys, sounds and drawing ----

// The values from the last submit (the table is filtered by these, not by what is being typed)
let mList = [];
let kList = [];

const allocator = new SoundAllocator(ALL_SOUNDS);

// The store calls this once after every change to the keys
function redraw() {
  allocator.assign(store.auditioningSets); // sounds (and so colours) must be settled before the table is drawn
  renderKeysTable(store.keys, output, {
    mQuery: mList,
    kQuery: kList,
    colorOf: set => allocator.colorOf(set),
    onTogglePinned: key => store.togglePinned(key),
    onToggleSetAudition: setId => store.toggleSetAudition(setId),
  });
  play(allocator.layers()).catch(err => console.error(err));
}

const store = new KeyStore(redraw);

form.addEventListener('submit', e => {
  e.preventDefault();
  document.activeElement?.blur(); // Enter leaves the field, which tidies its text

  const config = configField.value;
  if (config.length < 2) {
    hint.textContent = 'Enter at least 2 numbers';
    return;
  }
  mList = mField.value;
  kList = kField.value;

  // Keys that were playing carry on if the new search still shows them.
  // This notifies the store's listener, which redraws.
  store.replaceUnpinned(getKeys(config), key => key.matches(mList, kList));
});

// ---- hotkeys (they also fill in the help dialog) ----

// Re-roll the sounds and say so
function onRandomize() {
  allocator.randomizeUnassigned();
  showToast('Sounds re-rolled');
}

// Copy the current pattern to the clipboard and say so
async function onExport() {
  const code = patternCode(allocator.layers());
  if (!code) {
    showToast('Nothing to export');
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
    showToast('Copied!');
  } catch (err) {
    console.error(err);
    showToast('Export failed');
  }
}

setupHotkeys({
  dialog: document.getElementById('hotkeys'),
  list: document.getElementById('hotkey-list'),
  helpButton: document.getElementById('help'),
  entries: [
    { display: 'Enter', label: 'Submit (while typing in a field)' },
    { key: 'r', label: "Re-roll sounds: forget the sounds of sets that aren't playing", action: onRandomize },
    { key: 'e', label: 'Export the pattern (copies it to the clipboard)', action: onExport },
    { key: 'u', label: 'Unaudition all', action: () => store.unauditionAll() },
  ],
});
