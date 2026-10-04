function range(n) {
  return Array.from({ length: n }, (_, n) => n);
}
function* product(...pools) {
  if (!pools.length) {
    yield [];
    return;
  }
  const indices = new Array(pools.length).fill(0);
  while (true) {
    yield indices.map((idx, i) => pools[i][idx]);
    let i = pools.length - 1;
    while (i >= 0 && ++indices[i] === pools[i].length) indices[i--] = 0;
    if (i < 0) return;
  }
}

export { range, product };
