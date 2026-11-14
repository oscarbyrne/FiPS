// Pure text handling for the three input fields: which characters are allowed
// while typing, how the text becomes values, and how values become text again.
// No DOM in here.

// ---- while typing ----
// Each `fix` function keeps, drops or swaps single characters (it never looks
// at neighbours). That lets a field work out where the caret ends up by fixing
// just the text before it.

// Digits, commas and whitespace; whitespace becomes a comma. "→" is accepted
// too (and becomes a comma), so a pasted "16 → 4" works in the Config field.
export const fixNumberList = v => v.replace(/[^\d\s,→]/g, '').replace(/[\s→]/g, ',');

// Digits, commas, ":" and whitespace; whitespace becomes a comma, "/" becomes ":"
export const fixK = v => v.replace(/[^\d\s,:/]/g, '').replace(/\s/g, ',').replace(/\//g, ':');

// ---- text to values ----

// dedupe, drop zeros, largest first
export function parseConfig(text) {
  const parts = text.split(',').filter(Boolean);
  return [...new Set(parts.map(Number))].filter(n => n > 0).sort((a, b) => b - a);
}

// m list: keeps order, repeats and zeros; drops empty and non-numeric entries
export function parseM(text) {
  return text.split(',').filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
}

// k classes: "1:2,3:4" -> [[1, 2], [3, 4]]; drops malformed entries,
// zero denominators, and exact repeats
export function parseK(text) {
  const seen = new Set();
  const out = [];
  for (const part of text.split(',')) {
    const match = /^(\d+):(\d+)$/.exec(part);
    if (!match) continue;
    const n = Number(match[1]);
    const d = Number(match[2]);
    if (d === 0 || seen.has(`${n}:${d}`)) continue;
    seen.add(`${n}:${d}`);
    out.push([n, d]);
  }
  return out;
}

// ---- values to text (the editable form, e.g. "16,4" or "1:2,3:4") ----

export const numbersToText = list => list.join(',');

export const kClassesToText = list => list.map(([n, d]) => `${n}:${d}`).join(',');
