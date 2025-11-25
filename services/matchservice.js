const driver = require("../db/neo");
const normalize = require("../utils/normalize");
const { similarityScore } = require("../utils/similarity");

module.exports = {
  async findCandidates(raw, limit = 3) {
    const norm = normalize(raw);
    limit = parseInt(limit) || 3;

    const session = driver.session();
    try {
      // Alias exact
      const aliasRes = await session.run(
        `
        MATCH (p:Person)-[:HAS_ALIAS]->(a:Alias)
        WHERE a.normalized = $norm
        RETURN p LIMIT toInteger($limit)
        `,
        { norm, limit }
      );

      if (aliasRes.records.length > 0) {
        return aliasRes.records.map(rec => ({
          personId: rec.get("p").properties.id,
          name: rec.get("p").properties.name,
          score: 1.0
        }));
      }

      // Person exact
      const personExact = await session.run(
        `MATCH (p:Person) WHERE p.normalized = $norm RETURN p LIMIT toInteger($limit)`,
        { norm, limit }
      );

      if (personExact.records.length > 0) {
        return personExact.records.map(rec => ({
          personId: rec.get("p").properties.id,
          name: rec.get("p").properties.name,
          score: 0.98
        }));
      }

      // Fuzzy fallback
      const all = await session.run(`MATCH (p:Person) RETURN p`);
      const scored = all.records.map(r => {
        const p = r.get("p").properties;
        let s = similarityScore(norm, p.normalized);
        return {
          personId: p.id,
          name: p.name,
          score: Number(s.toFixed(3))
        };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit);
    } finally {
      await session.close();
    }
  }
};
