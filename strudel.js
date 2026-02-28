const FiPS = {
  // Recursive J function models a FiPS configuration space
  // action on beam k
  // Source: https://tinyurl.com/plotkin-fips
  J(d, m, k) {
    if (d.length < 2 || m.length < 1) {
      return k
    }
    k = FiPS.J(d.slice(1), m.slice(1), k)
    return Math.floor((k * d[0] + m[0]) / d[1])
  },

  collection(d, m) {
    let dn = d.at(-1)
    var notes = []
    for (let k = 0; k < dn; k++) {
      notes.push(FiPS.J(d, m, k))
    }
    return notes
  },

  init() {
    register(
      'fips_beat',
      function(d, m, pat) {
        return pat.beat(
          stack(...FiPS.collection(d, m)),
          d[0]
        )
      }
    )
    register(
      'fips_scale',
      function(d, m, oct, pat) {
        return pat.inhabit(
          FiPS.collection(d, m)
        ).note().transpose(12 * oct)
      }
    )
  },
}
