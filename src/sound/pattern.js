// The playing layers ({ kClassSet, sound }) as Strudel code. This is the single
// description of the pattern: the player runs this exact code and the E hotkey
// copies it, so what you hear is what you export.

import { gcd, toPosition } from '../kclass.js';

const lcm = (a, b) => (a / gcd(a, b)) * b;

// positions [n, d] on a grid of `size` equal steps -> "x ~ ~ x ~ ..."
function gridString(positions, size) {
  const steps = Array(size).fill('~');
  for (const [n, d] of positions) steps[n * (size / d)] = 'x';
  return steps.join(' ');
}

// Largest single grid we'll write before switching to one grid per denominator
const MAX_GRID = 48;

// A kClassSet as a struct argument, e.g. "x ~ x ~" for [[0,1],[1,2]]
function kClassSetToStruct(kClassSet) {
  const positions = kClassSet.map(toPosition);
  const size = positions.reduce((acc, [, d]) => lcm(acc, d), 1);

  // Usual case: every position fits one grid, so it's a single readable string
  if (size <= MAX_GRID) return `"${gridString(positions, size)}"`;

  // Denominators too awkward for one grid: stack one small grid per denominator
  const byDenominator = new Map();
  for (const position of positions) {
    const d = position[1];
    if (!byDenominator.has(d)) byDenominator.set(d, []);
    byDenominator.get(d).push(position);
  }
  const grids = [...byDenominator].map(([d, ps]) => `"${gridString(ps, d)}"`);
  return `stack(${grids.join(', ')})`;
}

// The layers as code, or '' if there are none
export function patternCode(layers) {
  if (layers.length === 0) return '';

  const lines = layers.map(
    ({ kClassSet, sound: { bank, name } }) =>
      `  s("${bank}_${name}").struct(${kClassSetToStruct(kClassSet)})`
  );

  return `stack(\n${lines.join(',\n')}\n)`;
}
