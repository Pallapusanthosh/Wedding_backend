module.exports = function extractRelation(text) {
  text = text.toLowerCase();

  // detect modifiers
  let ageMod = null;
  if (text.includes("younger") || text.includes("chinna") || text.includes("tammudu"))
    ageMod = "YOUNGER";
  if (text.includes("elder") || text.includes("older") || text.includes("pedda"))
    ageMod = "ELDER";

  // BROTHER
  if (/brother|anna|tammudu/.test(text)) {
    if (ageMod === "YOUNGER") return "YOUNGER BROTHER";
    if (ageMod === "ELDER") return "ELDER BROTHER";
    return "BROTHER";
  }

  // SISTER
  if (/sister|akka|chelli|chella/.test(text)) {
    if (ageMod === "YOUNGER") return "YOUNGER SISTER";
    if (ageMod === "ELDER") return "ELDER SISTER";
    return "SISTER";
  }

  if (/cousin|maridi|bava/.test(text)) return "COUSIN";
  if (/uncle|babai|mama/.test(text)) return "UNCLE";
  if (/aunt|atta|peddamma|pinni/.test(text)) return "AUNT";
  if (/friend|chitti/.test(text)) return "FRIEND";
  if (/nephew|sodharudu/.test(text)) return "NEPHEW";
  if (/niece|maradalu/.test(text)) return "NIECE";

  return null;
};
