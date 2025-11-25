const express = require("express");
const router = express.Router();

const aliasService = require("../services/aliasservice");
const matchService = require("../services/matchservice");
const personService = require("../services/personservice");
const relationshipService = require("../services/relationshipservice");
const driver = require("../db/neo");
const normalize = require("../utils/normalize");
const extractRelation = require("../utils/extractrelationship");

function detectRoleLine(line) {
  const m = line.match(/^\s*(Bride|Groom)\s*[:\-]\s*(.+)$/i);
  if (!m) return null;
  return {
    role: m[1].toLowerCase() === "bride" ? "Bride" : "Groom",
    name: m[2].trim()
  };
}

function parseRelationLine(line) {
  const rel = extractRelation(line);
  if (!rel) return null;

  let cleaned = line.toLowerCase();

  cleaned = cleaned
    .replace(/\b(bride|brides|bride's|groom|grooms|groom's)\b/g, "")
    .replace(/\b(friend|family|relative|side|of)\b/g, "")
    .replace(/\b(younger|elder|older|chinna|pedda)\b/g, "")
    .replace(/\b(brother|sister|cousin|uncle|aunt|nephew|niece|grandfather|grandmother|father|mother|son|daughter)\b/g, "")
    .replace(/\b(anna|akka|chelli|chella|tammudu|babai|mama|maridi|pinni|peddamma)\b/g, "")
    .trim();

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return {
    relation: rel,
    name: cleaned || line
  };
}


router.post("/raw", async (req, res) => {
  try {
    const { raw, projectId } = req.body;
    if (!raw || !projectId) {
      return res.status(400).json({ error: "raw + projectId required" });
    }

    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

    // -------------------------------
    // PASS 1: DETECT BRIDE/GROOM
    // -------------------------------
    let brideId = null;
    let groomId = null;

    for (const line of lines) {
      const roleObj = detectRoleLine(line);
      if (!roleObj) continue;

      const { role, name } = roleObj;
      const candidates = await matchService.findCandidates(name, 1);

      let pid = null;

      if (candidates[0] && candidates[0].score >= 0.6) {
        pid = candidates[0].personId;
      } else {
        const newP = await personService.createPerson(name);
        pid = newP.id;
      }

      const s = driver.session();
      await s.run(
        `
        MATCH (pr:Project {id:$projectId})
        MATCH (p:Person {id:$pid})
        MERGE (p)-[b:BELONGS_TO {role:$role}]->(pr)
        SET b.assignedAt = timestamp()
        `,
        { projectId, pid, role }
      );
      await s.close();

      if (role === "Bride") brideId = pid;
      if (role === "Groom") groomId = pid;
    }

    // guarantee bride/groom IDs found
    // (relations need this)
    const session = driver.session();
    if (!brideId) {
      const b = await session.run(
        `MATCH (p)-[:BELONGS_TO {role:'Bride'}]->(:Project {id:$projectId}) RETURN p LIMIT 1`,
        { projectId }
      );
      if (b.records[0]) brideId = b.records[0].get("p").properties.id;
    }

    if (!groomId) {
      const g = await session.run(
        `MATCH (p)-[:BELONGS_TO {role:'Groom'}]->(:Project {id:$projectId}) RETURN p LIMIT 1`,
        { projectId }
      );
      if (g.records[0]) groomId = g.records[0].get("p").properties.id;
    }
    await session.close();

    // -------------------------------
    // PASS 2: PROCESS RELATION LINES
    // -------------------------------
    for (const line of lines) {
      const isRoleLine = detectRoleLine(line);
      if (isRoleLine) continue; // skip bride/groom assignment lines

      const relObj = parseRelationLine(line);
      if (!relObj) continue;

      const { relation, name } = relObj;

      // match or create target person
      const candidates = await matchService.findCandidates(name, 1);
      let person = null;

      if (candidates[0] && candidates[0].score >= 0.6) {
        person = { id: candidates[0].personId, name: candidates[0].name };
      } else {
        person = await personService.createPerson(name);
      }

      // detect side: bride / groom
      let fromId = null;
      const lower = line.toLowerCase();

        const isBrideSide =
          lower.includes("bride") ||
          lower.includes("brides") ||
          lower.includes("bride's");

        const isGroomSide =
          lower.includes("groom") ||
          lower.includes("grooms") ||
          lower.includes("groom's");

        if (isBrideSide) fromId = brideId;
        if (isGroomSide) fromId = groomId;

        

      if (fromId) {
        await relationshipService.addRelation(fromId, person.id, relation);
      }


      // link alias → person
      await aliasService.createAndLinkAlias({
        raw: line,
        projectId,
        personId: person.id,
        confidence: 0.8
      });
    }

    // -------------------------------
    // PASS 3: FALLBACK RAW ALIASES
    // -------------------------------
    for (const line of lines) {
      if (detectRoleLine(line)) continue;
      if (parseRelationLine(line)) continue;
      await aliasService.createAliasRaw({ raw: line, projectId });
    }

    return res.json({ message: "OK" });

  } catch (err) {
    console.error("aliases raw error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
