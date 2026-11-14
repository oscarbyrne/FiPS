// The music theory behind the Inspectigator: the J function and the keys built from it.

import { Key } from './key.js';

// The J function of John Clough and Jack Douthett (from their work on
// maximally even sets): J(c, d, m)(k) = floor((c * k + m) / d).
//
// This is the nested form. `d` is the list of cardinalities and `m` the list
// of rotations, one per level. The deepest level is applied to `k` first, and
// each level up applies the formula to that result.
export function J(d, m, k) {
  if (d.length < 2 || m.length < 1) return k;
  k = J(d.slice(1), m.slice(1), k);
  return Math.floor((k * d[0] + m[0]) / d[1]);
}

const arrayRange = n => Array.from({ length: n }, (_, i) => i);

// Every combination with one item from each pool, the last pool varying fastest
const product = (...pools) =>
  pools.reduce((combos, pool) => combos.flatMap(combo => pool.map(x => [...combo, x])), [[]]);

// Every key for a config: one per combination of rotations, each holding the
// K class set that J gives for every beam of the last cardinality.
export function getKeys(config) {
  const rotations = product(...config.slice(0, -1).map(arrayRange));
  const beams = arrayRange(config.at(-1));

  return rotations.map(m => new Key(beams.map(k => J(config, m, k)), config, m));
}
