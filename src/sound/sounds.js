// The palette of sounds the app can play.

// Drexciya palette. Bank and sound names verified against the sample map in player.js.
const DRUM_MACHINES = {
  RolandTR808 : ['bd:8', 'rim', 'perc:10'],
  RolandTR909 : ['bd', 'hh'],
  RolandTR606 : ['sd', 'hh', 'oh'],
};

// Each sound gets its own colour, a translucent one for highlighting table rows.
// Hues step by the golden angle so sounds close together in the list still look different.
const soundColor = i => `hsl(${Math.round((i * 137.508) % 360)} 70% 50% / 0.3)`;

// Every sound as { bank, name, id, color }
export const ALL_SOUNDS = Object.entries(DRUM_MACHINES)
  .flatMap(([bank, names]) =>
    names.map(name => ({ bank, name, id: `${bank}:${name}` }))
  )
  .map((snd, i) => ({ ...snd, color: soundColor(i) }));
