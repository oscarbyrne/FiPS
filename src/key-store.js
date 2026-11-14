// The one place the key list is held and changed. Every method that changes
// something calls `onChange` exactly once, however many keys it touched.
export class KeyStore {
  #keys = [];
  #onChange;

  constructor(onChange) {
    this.#onChange = onChange;
  }

  get keys() {
    return this.#keys;
  }

  // The K class sets that have at least one auditioning key, each listed once
  get auditioningSets() {
    const sets = new Map();
    for (const key of this.#keys) {
      if (key.auditioning && !sets.has(key.setId)) sets.set(key.setId, key.kClassSet);
    }
    return [...sets.values()];
  }

  // A new search: keep pinned keys, drop unpinned ones, add the new keys, remove
  // duplicates. Pinned keys come first so they win over a duplicate new key.
  //
  // What was playing carries on if it is still in the results: an auditioning
  // pinned key (pinned keys always stay), or an auditioning unpinned key that the
  // new search produces again and `isShown(key)` says is shown (the table's filters).
  // Audition is per K class set, so the whole set carries on with it. Anything
  // else stops.
  replaceUnpinned(newKeys, isShown) {
    const pinned = this.#keys.filter(k => k.pinned);
    const wasAuditioning = new Set(this.#keys.filter(k => !k.pinned && k.auditioning).map(k => k.id));

    const keepPlaying = new Set([
      ...pinned.filter(k => k.auditioning).map(k => k.setId),
      ...newKeys.filter(k => wasAuditioning.has(k.id) && isShown(k)).map(k => k.setId),
    ]);

    const seen = new Set();
    this.#keys = [...pinned, ...newKeys].filter(k => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
    this.#keys.forEach(k => { k.auditioning = keepPlaying.has(k.setId); });

    this.#onChange();
  }

  togglePinned(key) {
    key.pinned = !key.pinned;
    this.#onChange();
  }

  // Audition every key of a K class set, pinned or not, shown or not.
  // If all of them are already auditioning they all turn off; otherwise they all turn on.
  toggleSetAudition(setId) {
    const group = this.#keys.filter(k => k.setId === setId);
    if (group.length === 0) return;

    const turnOn = !group.every(k => k.auditioning);
    group.forEach(k => { k.auditioning = turnOn; });
    this.#onChange();
  }

  unauditionAll() {
    if (!this.#keys.some(k => k.auditioning)) return;

    this.#keys.forEach(k => { k.auditioning = false; });
    this.#onChange();
  }
}
