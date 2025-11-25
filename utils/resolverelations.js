// utils/resolveRelation.js
const relationLabels = require("./relationshipslabels");
const extractRelation = require("./extractrelationship");
const aliases = require("../data/aliases");
const relationships = require("../data/relationships");
const people = require("../data/people");

function findProjectRolePerson(projectId, roleKeywords) {
  // roleKeywords example: ['bride','brides'] or ['groom','grooms']
  const projectAliases = aliases.filter(a => a.projectId == projectId && a.personId);
  for (const a of projectAliases) {
    const rawLower = (a.raw || "").toLowerCase();
    for (const kw of roleKeywords) {
      if (rawLower.includes(kw) || a.normalized === kw) return a.personId;
    }
    // also check relationHint if stored (we didn't store earlier, but safe)
    const rh = extractRelation(a.raw);
    if (rh && roleKeywords.includes(rh.toLowerCase())) return a.personId;
  }
  return null;
}

function hasDirectRelationship(candidateId, otherId, types = []) {
  if (!otherId) return false;
  return relationships.some(r => {
    const matchesType = types.length ? types.includes(r.type) : true;
    return matchesType && ((r.from === candidateId && r.to === otherId) || (r.from === otherId && r.to === candidateId));
  });
}

/**
 * Resolve final relation label
 * - projectId: id of project
 * - candidateId: person id we matched
 * - relationHint: extracted hint from raw alias (BROTHER, BRIDE_SIDE, etc.)
 */
module.exports = function resolveRelation(projectId, candidateId, relationHint) {
  const brideId = findProjectRolePerson(projectId, ["bride", "brides"]);
  const groomId = findProjectRolePerson(projectId, ["groom", "grooms"]);

  // if candidate is the bride/groom themselves
  if (brideId && candidateId === brideId) return "Bride";
  if (groomId && candidateId === groomId) return "Groom";

  const hint = relationHint ? relationHint.toUpperCase() : null;

  // direct graph-based inference: siblings, parents etc. (prefer explicit graph edges)
  if (brideId && hasDirectRelationship(candidateId, brideId, ["SIBLING"])) {
    if (hint === "SISTER") return "Bride's Sister";
    if (hint === "BROTHER") return "Bride's Brother";
    return "Bride's Sibling";
  }
  if (groomId && hasDirectRelationship(candidateId, groomId, ["SIBLING"])) {
    if (hint === "SISTER") return "Groom's Sister";
    if (hint === "BROTHER") return "Groom's Brother";
    return "Groom's Sibling";
  }

  // If relationHint explicitly says it's bride/groom side, prefer that side
  if (hint === "BRIDE_SIDE" && brideId) return relationLabels.pretty("BROTHER", "Bride").replace("Brother", "Relative"); // fallback
  if (hint === "GROOM_SIDE" && groomId) return relationLabels.pretty("BROTHER", "Groom").replace("Brother", "Relative");

  // If we have a direct hint like BROTHER / SISTER / COUSIN etc., format it using side preference
  if (hint === "BROTHER") {
    if (brideId) return "Bride's Brother";
    if (groomId) return "Groom's Brother";
    return "Brother";
  }
  if (hint === "SISTER") {
    if (brideId) return "Bride's Sister";
    if (groomId) return "Groom's Sister";
    return "Sister";
  }
  if (hint === "COUSIN") {
    if (brideId) return "Bride's Cousin";
    if (groomId) return "Groom's Cousin";
    return "Cousin";
  }
  if (hint === "UNCLE" || hint === "AUNT") {
    if (brideId) return `Bride's ${hint === "UNCLE" ? "Uncle" : "Aunt"}`;
    if (groomId) return `Groom's ${hint === "UNCLE" ? "Uncle" : "Aunt"}`;
    return hint === "UNCLE" ? "Uncle" : "Aunt";
  }
  if (hint === "FATHER" || hint === "MOTHER") {
    if (brideId) return `Bride's ${hint === "FATHER" ? "Father" : "Mother"}`;
    if (groomId) return `Groom's ${hint === "FATHER" ? "Father" : "Mother"}`;
    return hint === "FATHER" ? "Father" : "Mother";
  }

  // Default: no relation known → return null (so title will be just name)
  return null;
};
