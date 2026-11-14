import { reduceKClass, kClassSetId, cmpFrac } from './kclass.js';

// A key is plain data (plus a read-only search check). Changing one (pinning,
// auditioning) goes through the KeyStore, so that each user action produces
// exactly one change notification.
export class Key {
  pinned = false;
  auditioning = false;

  constructor(ks, config, m) {
    this.kClassSet = ks.map(k => reduceKClass(k, config[0]));
    this.config = config;
    this.m = m;
    this.setId = kClassSetId(this.kClassSet); // keys with the same set audition together
    this.id = JSON.stringify([this.kClassSet, config, m]); // identical keys share an id
  }

  // Is this key in the results of a search?
  //   mQuery  integers its m must start with, in order ([2] matches [2, 6, 8], not [1, 2])
  //   kQuery  [n, d] fractions its K class set must all contain, compared by value
  //           ([2, 4] matches a set holding [1, 2])
  // Empty queries match everything.
  matches(mQuery, kQuery) {
    return (
      mQuery.length <= this.m.length &&
      mQuery.every((n, i) => this.m[i] === n) &&
      kQuery.every(q => this.kClassSet.some(f => cmpFrac(f, q) === 0))
    );
  }
}
