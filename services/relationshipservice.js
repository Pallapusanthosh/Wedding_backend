const driver = require("../db/neo");

module.exports = {
  async addRelation(brideOrGroomId, personId, relation) {
    
    const type = relation.toUpperCase().replace(/\s+/g, "_");

    const session = driver.session();
    try {
      await session.run(
        `
        MATCH (p:Person {id:$personId}), (bg:Person {id:$bgId})
        // Correct direction: PERSON → BRIDE/GROOM
        MERGE (p)-[:${type}]->(bg)
        `,
        { personId, bgId: brideOrGroomId }
      );
    } finally {
      await session.close();
    }
  }
};
