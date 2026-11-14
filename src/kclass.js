// K classes are fractions written [n, d] with whole numbers and d > 0.
// A K class set is a list of them.

export function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// A stable string id for a K class set, for use as a Map key or for comparing sets
export const kClassSetId = kClassSet => JSON.stringify(kClassSet);

// value / cardinality in lowest terms, as [n, d]
export function reduceKClass(value, cardinality) {
  const g = gcd(value, cardinality);
  return [value / g, cardinality / g];
}

// Compare two [n, d] fractions by value (1/4 < 1/2)
export const cmpFrac = ([n1, d1], [n2, d2]) => n1 * d2 - n2 * d1;

// A K class as a reduced position [n, d], meaning n/d of the way through the cycle
export function toPosition([num, den]) {
  const n = ((num % den) + den) % den;
  const g = gcd(n, den);
  return [n / g, den / g];
}
