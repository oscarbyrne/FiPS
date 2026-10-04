import * as Sequence from './util/sequence.js';
import * as Douthett from './util/douthett.js';

function addReadings(config, keyPool) {
  const rotations = Sequence.product(
    ...config.slice(0, -1).map(Sequence.range)
  );
  for (const m of rotations) {
    const beams = Sequence.range(config.at(-1));
    keyPool.getInstance(
      beams.map(k => Douthett.J(config, m, k)),
      config[0]
    ).addReading(config, m);
  }
}

function updateConfig(config, keyPool) {
  keyPool.removeUnpinned();
  addReadings(config, keyPool);
}

export { updateConfig };
