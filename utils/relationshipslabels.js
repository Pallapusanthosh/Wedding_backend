
function relationLabel(rel, fromBride, fromGroom) {
rel = rel.toUpperCase();
if (rel === "NEPHEW")
  return fromBride ? "Bride's Nephew" : fromGroom ? "Groom's Nephew" : "Nephew";

if (rel === "NIECE")
  return fromBride ? "Bride's Niece" : fromGroom ? "Groom's Niece" : "Niece";

if (rel === "GRANDFATHER")
  return fromBride ? "Bride's Grandfather" : fromGroom ? "Groom's Grandfather" : "Grandfather";

if (rel === "GRANDMOTHER")
  return fromBride ? "Bride's Grandmother" : fromGroom ? "Groom's Grandmother" : "Grandmother";

if (rel === "FATHER")
  return fromBride ? "Bride's Father" : fromGroom ? "Groom's Father" : "Father";

if (rel === "MOTHER")
  return fromBride ? "Bride's Mother" : fromGroom ? "Groom's Mother" : "Mother";

if (rel === "SON")
  return fromBride ? "Bride's Son" : fromGroom ? "Groom's Son" : "Son";

if (rel === "DAUGHTER")
  return fromBride ? "Bride's Daughter" : fromGroom ? "Groom's Daughter" : "Daughter";
if (rel === "NEPHEW")
  return fromBride ? "Bride's Nephew" : fromGroom ? "Groom's Nephew" : "Nephew";

if (rel === "NIECE")
  return fromBride ? "Bride's Niece" : fromGroom ? "Groom's Niece" : "Niece";

if (rel === "YOUNGER BROTHER")
  return fromBride ? "Bride's Younger Brother" : fromGroom ? "Groom's Younger Brother" : "Younger Brother";

if (rel === "ELDER BROTHER")
  return fromBride ? "Bride's Elder Brother" : fromGroom ? "Groom's Elder Brother" : "Elder Brother";

if (rel === "YOUNGER SISTER")
  return fromBride ? "Bride's Younger Sister" : fromGroom ? "Groom's Younger Sister" : "Younger Sister";

if (rel === "ELDER SISTER")
  return fromBride ? "Bride's Elder Sister" : fromGroom ? "Groom's Elder Sister" : "Elder Sister";
return null;

}

module.exports = {
  relationLabel
};
