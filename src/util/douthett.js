function J(d, m, k) {
  if (d.length < 2 || m.length < 1) return k;
  k = J(d.slice(1), m.slice(1), k);
  return Math.floor((k * d[0] + m[0]) / d[1]);
}

export { J };
