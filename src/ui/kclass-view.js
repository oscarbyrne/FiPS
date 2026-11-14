// A K class set as DOM nodes: n followed by <sub>d</sub>, separated by commas.
// Used by both the table and the K classes field so they look the same.
export function kClassNodes(kClassSet) {
  const nodes = [];
  kClassSet.forEach(([n, d], i) => {
    if (i > 0) nodes.push(', ');
    const sub = document.createElement('sub');
    sub.textContent = d;
    nodes.push(String(n), sub);
  });
  return nodes;
}
