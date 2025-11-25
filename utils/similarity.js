// utils/similarity.js
const normalize = require("./normalize");
const levenshtein = require("./levenshtein");

function tokenOverlapScore(a, b) {
  const sa = new Set(a.split(" ").filter(Boolean));
  const sb = new Set(b.split(" ").filter(Boolean));
  if (!sa.size || !sb.size) return 0;
  const inter = [...sa].filter(x => sb.has(x));
  return inter.length / Math.max(sa.size, sb.size);
}

function similarityScore(a, b) {
  a = normalize(a);
  b = normalize(b);
  if (a === b) return 1.0;
  const dist = levenshtein(a, b);
  const max = Math.max(a.length, b.length);
  if (max === 0) return 0;
  const lev = 1 - dist / max;
  const tok = tokenOverlapScore(a, b);
  return Math.max(0, 0.6 * lev + 0.4 * tok);
}

module.exports = { similarityScore };
