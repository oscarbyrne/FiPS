import * as Compare from './util/compare.js';

const updateEvent = new CustomEvent('model:update');

class KClass {

  #gcd(a, b) {
    return (b === 0 ? Math.abs(a) : this.#gcd(b, a % b));
  }

  constructor(value, cardinality) {
    const gcd = this.#gcd(value, cardinality);
    this.k = value / gcd;
    this.d = cardinality / gcd;
  }

  static compare(a, b) {
    return Compare.integers(a.k, b.k) || Compare.integers(b.d, a.d);
  }
}

class KClassSet {

  constructor(kClasses) {
    this.kClasses = kClasses;
  }

  static fromValueSet(valueSet, cardinality) {
    return new KClassSet(
      valueSet.map(value => new KClass(value, cardinality))
    );
  }

  static compare(a, b) {
    return Compare.arrays(a.kClasses, b.kClasses, KClass.compare);
  }
}

class Reading {

  constructor(config, m) {
    this.config = config;
    this.m = m;
  }

}

class Toggle {

  constructor(options, initial=0) {
    this.options = options;
    this.pointer = initial;
  }

  get value() {
    return this.options[this.pointer];
  }

  get on() {
    return this.pointer > 0;
  }

  increment() {
    this.pointer = (this.pointer + 1) % this.options.length;
    document.dispatchEvent(updateEvent);
  }

}

class Key {

  constructor(kClassSet, readings, pinnedStatus, auditionStatus) {
    this.kClassSet = kClassSet;
    this.readings = readings;
    this.pinnedStatus = new Toggle(["☐", "🗹"]);
    this.auditionStatus = new Toggle(["✋", "🪘", "🎹"]);
  }

  static compare(a, b) {
    return KClassSet.compare(a.kClassSet, b.kClassSet);
  }

  addReading(config, m) {
    this.readings.push(
      new Reading(config, m)
    );
    document.dispatchEvent(updateEvent);
  }
}

class KeyPool {

  constructor() {
    this.cache = new Map();
  }

  getInstance(valueSet, cardinality) {
    const kClassSet = KClassSet.fromValueSet(
      valueSet,
      cardinality
    );
    const hash = JSON.stringify(kClassSet);
    if (!this.cache.has(hash)) {
      this.cache.set(
        hash,
        new Key(kClassSet, [], false, 0)
      );
    }
    return this.cache.get(hash);
  }

  removeUnpinned() {
    for (const [hash, key] of this.cache) {
      if (!key.pinnedStatus.on) {
        this.cache.delete(hash);
      }
    }
    document.dispatchEvent(updateEvent);
  }

  get sortedValues() {
    return [...this.cache.values()].sort(Key.compare);
  }
}

export { KeyPool };
