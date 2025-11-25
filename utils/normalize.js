module.exports = function normalize(name) {
  if (!name) return "";

  let n = name.toLowerCase();

  // remove punctuation
  n = n.replace(/['’`"()]/g, " ");

  // remove relationship words (this is the important part)
  n = n.replace(
    /\b(bride|brides|groom|grooms|brother|sister|cousin|uncle|aunty|aunt|mother|father|side|family|relation|chinna|peddha|mama|bava|akka|anna)\b/g,
    ""
  );

  // remove honorifics
  n = n.replace(/\b(mr|mrs|ms|dr|garu)\b/g, "");

  // collapse spaces
  n = n.replace(/\s+/g, " ").trim();

  // remove accents
  return n.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};
