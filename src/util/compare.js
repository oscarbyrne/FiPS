function integers(a, b) {
  return a - b;
}
function elements(a, b, comparator) {
  let c;
  for (let i = 0; i < a.length; i++) {
    c = comparator(a[i], b[i]);
    if (c !== 0) {
      break;
    } else {
      continue;
    }
  }
  return c;
}
function arrays(a, b, comparator) {
  return (
    integers(a.length, b.length) ||
    elements(a, b, comparator)
  );
}

export { integers, elements, arrays };
