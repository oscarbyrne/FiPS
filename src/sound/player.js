// The only module that uses Strudel. Strudel itself is loaded by the script tag
// in index.html, which defines the globals initStrudel and samples.

/* global initStrudel, samples */

import { patternCode } from './pattern.js';

const DRUM_MACHINES_URL =
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json';

// Initialized once, on the first play. If it fails, reload the page to try again.
// Resolves to Strudel's repl, whose evaluate() and stop() are used below instead
// of the global evaluate() and hush(): every evaluate() quietly replaces the
// global hush() with one that only resets pattern state and does not stop the sound.
let strudelReady;
const ensureStrudel = () =>
  (strudelReady ??= initStrudel({ prebake: () => samples(DRUM_MACHINES_URL) }));

let latest;  // the layers most recently asked for
let running; // the update loop below, while it is running

// Play these layers ({ kClassSet, sound }) together, replacing whatever was
// playing. It runs the same code that the export copies. With no layers,
// everything stops.
//
// Updates run one at a time, and the last request always wins. This matters
// because stop() works at once but evaluate() takes a moment before it starts
// playing: if they overlapped, an unaudition's stop() could land before an
// earlier audition's evaluate() finished, and the sound would start after being
// stopped.
export function play(layers) {
  latest = layers;
  running ??= applyLatest().finally(() => { running = null; });
  return running;
}

async function applyLatest() {
  const repl = await ensureStrudel();

  let applied;
  while (applied !== latest) { // asked again while busy? then catch up with the newest
    applied = latest;
    if (applied.length === 0) repl.stop();
    else await repl.evaluate(patternCode(applied));
  }
}
