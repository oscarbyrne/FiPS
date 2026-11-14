import { kClassSetId } from '../kclass.js';

const idsOf = sounds => new Set([...sounds].map(snd => snd.id));

// Fisher-Yates shuffle, in place
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffle in place so that no item stays at its old position (a derangement):
// a b c d can become b a d c, but never a d b c, where a didn't move.
// Reshuffles until nothing stayed put (about 3 tries on average). With fewer
// than 2 items there is nothing that can move, so it is left alone.
function shuffleAllMoved(arr) {
  if (arr.length < 2) return arr;
  const before = [...arr];
  do {
    shuffleArray(arr);
  } while (arr.some((item, i) => item === before[i]));
  return arr;
}

// Decides which sound each playing K class set holds. Pure logic: no DOM and no
// Strudel.
//
// Rules:
//   - A set that stops playing remembers its sound. When it returns it gets that
//     sound back, if no playing set holds it.
//   - A new set takes the sound most recently released by a set that stopped
//     playing (stealing it), then the first free sound in the stack.
//   - If a returning set finds its sound taken, it picks another free sound and
//     keeps that one from then on.
//
// A "layer" is a playing K class set with its sound: { kClassSet, sound }.
export class SoundAllocator {
  #order;            // every sound, in random order (the "stack")
  #layers = new Map(); // set id -> { kClassSet, sound } for every playing set

  // set id -> the sound it was last given, remembered while the set is not
  // playing. Two non-playing sets can remember the same sound (a newer set may
  // have stolen it). Kept in release order, newest last. Live memory only.
  #memory = new Map();

  // `sounds` is a list of { id, ... }
  constructor(sounds) {
    this.#order = shuffleArray([...sounds]);
  }

  // Tell the allocator which K class sets are playing now (each set once).
  // Safe to call repeatedly; it runs even with an empty list, so every sound is released.
  assign(kClassSets) {
    const ids = new Set(kClassSets.map(kClassSetId));

    // A set that stops playing moves to the end of the memory, so the memory
    // stays ordered by when sets were released, newest last
    for (const [id, { sound }] of [...this.#layers]) {
      if (ids.has(id)) continue;
      this.#layers.delete(id);
      this.#memory.delete(id);
      this.#memory.set(id, sound);
    }

    const starting = kClassSets.filter(set => !this.#layers.has(kClassSetId(set)));

    // Two passes, so a brand-new set can't steal a sound from a set that
    // returns in the same call:
    //   1. a returning set takes back its remembered sound if no playing set holds it
    for (const set of starting) {
      const id = kClassSetId(set);
      const remembered = this.#memory.get(id);
      if (remembered && !this.#playingIds().has(remembered.id)) {
        this.#layers.set(id, { kClassSet: set, sound: remembered });
      }
    }

    //   2. every other set takes the next sound and remembers it from then on
    for (const set of starting) {
      const id = kClassSetId(set);
      if (this.#layers.has(id)) continue;

      const sound = this.#nextSound();
      this.#memory.set(id, sound);
      this.#layers.set(id, { kClassSet: set, sound });
    }
  }

  // The colour of the sound a playing set holds, or null if it isn't playing
  colorOf(kClassSet) {
    return this.#layers.get(kClassSetId(kClassSet))?.sound.color ?? null;
  }

  // Every playing set with its sound, in the order the sets started
  layers() {
    return [...this.#layers.values()];
  }

  // Forget the sounds of sets that aren't playing, then re-roll the order of every
  // sound no playing set holds, so those sets get different sounds next time.
  // Sounds held by playing sets keep their slots and are untouched.
  randomizeUnassigned() {
    for (const id of this.#memory.keys()) {
      if (!this.#layers.has(id)) this.#memory.delete(id);
    }

    const used = idsOf(this.#memory.values());

    const freeSlots = [];   // positions in the stack that are unassigned
    const freeSounds = [];  // the sounds sitting in those positions

    this.#order.forEach((snd, i) => {
      if (!used.has(snd.id)) {
        freeSlots.push(i);
        freeSounds.push(snd);
      }
    });

    shuffleAllMoved(freeSounds); // every free sound lands in a different slot than before
    freeSlots.forEach((slot, i) => {
      this.#order[slot] = freeSounds[i];
    });
  }

  #playingIds() {
    return idsOf([...this.#layers.values()].map(layer => layer.sound));
  }

  // Pick a sound for a set that has none, or whose remembered sound is taken by a
  // playing set. Order of preference:
  //   1. the sound most recently released by a set that stopped playing, even
  //      though that set still remembers it and gets it back when it returns
  //      and the sound is free
  //   2. the first sound in the stack that isn't playing (one never handed out yet)
  //   3. if every sound is playing, wrap around and reuse
  #nextSound() {
    const playing = this.#playingIds();
    const newestReleasedFirst = [...this.#memory.values()].reverse();
    return (
      newestReleasedFirst.find(snd => !playing.has(snd.id)) ??
      this.#order.find(snd => !playing.has(snd.id)) ??
      this.#order[this.#layers.size % this.#order.length]
    );
  }
}
