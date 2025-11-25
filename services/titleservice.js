const driver = require("../db/neo");
const matchService = require("./matchservice");
const extractRelation = require("../utils/extractrelationship");

function relationLabel(rel, fromBride, fromGroom) {
  rel = rel.toUpperCase();
  if (rel === "BROTHER")
    return fromBride ? "Bride's Brother" : fromGroom ? "Groom's Brother" : "Brother";
  if (rel === "SISTER")
    return fromBride ? "Bride's Sister" : fromGroom ? "Groom's Sister" : "Sister";
  if (rel === "COUSIN")
    return fromBride ? "Bride's Cousin" : fromGroom ? "Groom's Cousin" : "Cousin";
  if (rel === "UNCLE")
    return fromBride ? "Bride's Uncle" : fromGroom ? "Groom's Uncle" : "Uncle";
  if (rel === "AUNT")
    return fromBride ? "Bride's Aunt" : fromGroom ? "Groom's Aunt" : "Aunt";
  if (rel === "FRIEND")
    return fromBride ? "Bride's Friend" : fromGroom ? "Groom's Friend" : "Friend";
  return null;
}

module.exports = {
  async previewTitles(projectId) {
    const session = driver.session();
    const titles = [];
    const seen = new Set();

    try {
      // Get bride & groom
      const bride = await session.run(
        `MATCH (p)-[:BELONGS_TO {role:'Bride'}]->(:Project {id:$projectId}) RETURN p LIMIT 1`,
        { projectId }
      );

      const groom = await session.run(
        `MATCH (p)-[:BELONGS_TO {role:'Groom'}]->(:Project {id:$projectId}) RETURN p LIMIT 1`,
        { projectId }
      );

      const brideId = bride.records[0]?.get("p")?.properties.id || null;
      const groomId = groom.records[0]?.get("p")?.properties.id || null;

      // Title 1: Bride
      if (brideId) {
        const p = bride.records[0].get("p").properties;
        const t = `${p.name} — Bride`;
        seen.add(t);
        titles.push({ title: t });
      }

      // Title 2: Groom
      if (groomId) {
        const p = groom.records[0].get("p").properties;
        const t = `${p.name} — Groom`;
        if (!seen.has(t)) {
          seen.add(t);
          titles.push({ title: t });
        }
      }

      // All aliases
      const ares = await session.run(
        `
        MATCH (a:Alias {projectId:$projectId})
        OPTIONAL MATCH (p:Person)-[:HAS_ALIAS]->(a)
        RETURN a,p
        `,
        { projectId }
      );

      for (const r of ares.records) {
        const a = r.get("a").properties;
        const pNode = r.get("p")?.properties;

        if (!pNode) continue; // shouldn't happen

        const name = pNode.name;
        const id = pNode.id;

        // relation detection
        const hint = extractRelation(a.raw);
        let label = null;

        if (brideId) {
          const br = await session.run(
            `MATCH (x:Person {id:$id})-[:BROTHER
 |:SISTER
 |:YOUNGER_BROTHER
 |:ELDER_BROTHER
 |:YOUNGER_SISTER
 |:ELDER_SISTER
 |:COUSIN
 |:UNCLE
 |:AUNT
 |:NEPHEW
 |:NIECE
 |:FRIEND]
->(:Person {id:$brideId})\
            return x
`,{ id, brideId }
          );
          if (br.records.length) {
            label = relationLabel(hint, true, false) || "Bride's Relative";
          }
        }

        if (!label && groomId) {
          const gr = await session.run(
            `MATCH (x:Person {id:$id})-[:BROTHER
 |:SISTER
 |:YOUNGER_BROTHER
 |:ELDER_BROTHER
 |:YOUNGER_SISTER
 |:ELDER_SISTER
 |:COUSIN
 |:UNCLE
 |:AUNT
 |:NEPHEW
 |:NIECE
 |:FRIEND]
->(:Person {id:$groomId})
            return x
`,
            { id, groomId }
          );
          if (gr.records.length) {
            label = relationLabel(hint, false, true) || "Groom's Relative";
          }
        }

        if (!label && hint) label = relationLabel(hint, false, false);

        const final = label ? `${name} — ${label}` : name;

        if (!seen.has(final)) {
          seen.add(final);
          titles.push({ title: final });
        }
      }

      return { projectId, titles };

    } finally {
      await session.close();
    }
  }
};
