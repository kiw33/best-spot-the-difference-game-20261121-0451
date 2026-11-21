// Tiny deterministic RNG (mulberry32) so a scene paints the same way every
// time for a given seed. The scenes themselves are hand-placed; the RNG only
// drives small decorations (stars, sparkles, pebbles) that would look stiff
// if they sat on a grid.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick `count` distinct integers in [0, n) using the RNG above.
export function pickIndices(rng, n, count) {
  const pool = [];
  for (let i = 0; i < n; i += 1) pool.push(i);
  const out = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}
