// services/aliasService.js
const driver = require("../db/neo");
const normalize = require("../utils/normalize");

module.exports = {
  /**
   * Create an Alias node and link to an existing Person node.
   * If alias node exists with same raw+projectId, return it.
   */
  async createAndLinkAlias({ raw, personId, projectId = null, confidence = 1.0 }) {
    const session = driver.session();
    const normalized = normalize(raw);
    try {
      const res = await session.run(
        `
        MERGE (a:Alias {raw:$raw, projectId:$projectId})
        ON CREATE SET a.normalized = $normalized, a.createdAt = timestamp()
        WITH a
        MATCH (p:Person {id:$personId})
        MERGE (p)-[r:HAS_ALIAS {projectId:$projectId}]->(a)
        SET r.confidence = $confidence, r.linkedAt = timestamp()
        RETURN a, p, r
        `,
        { raw, normalized, projectId, personId, confidence }
      );
      const rec = res.records[0];
      return {
        alias: rec.get("a").properties,
        person: rec.get("p").properties,
        rel: rec.get("r").properties
      };
    } finally {
      await session.close();
    }
  },

  /**
   * Save an alias node without linking to a person (raw/unconfirmed)
   */
  async createAliasRaw({ raw, projectId = null }) {
    const session = driver.session();
    const normalized = normalize(raw);
    try {
      const res = await session.run(
        `
        MERGE (a:Alias {raw:$raw, projectId:$projectId})
        ON CREATE SET a.normalized=$normalized, a.createdAt = timestamp()
        RETURN a
        `,
        { raw, projectId, normalized }
      );
      return res.records[0]?.get("a")?.properties || null;
    } finally {
      await session.close();
    }
  },

  async getAliasesByProject(projectId) {
    const session = driver.session();
    try {
      const res = await session.run(
        `
        MATCH (a:Alias {projectId:$projectId})
        OPTIONAL MATCH (p)-[r:HAS_ALIAS {projectId:$projectId}]->(a)
        RETURN a, p, r
        `,
        { projectId }
      );
      return res.records.map(rec => {
        const a = rec.get("a")?.properties || null;
        const p = rec.get("p")?.properties || null;
        const r = rec.get("r")?.properties || null;
        return { alias: a, person: p, rel: r };
      });
    } finally {
      await session.close();
    }
  },

  async findAliasByNormalized(norm, projectId = null) {
    const session = driver.session();
    try {
      const res = await session.run(
        `
        MATCH (a:Alias)
        WHERE a.normalized = $norm AND (a.projectId = $projectId OR $projectId IS NULL)
        RETURN a
        `,
        { norm, projectId }
      );
      return res.records.map(r => r.get("a").properties);
    } finally {
      await session.close();
    }
  }
};
