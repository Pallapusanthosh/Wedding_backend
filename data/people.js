const normalize = require("../utils/normalize");

module.exports = [
  {
    id: 1,
    canonicalName: "Asha Devi",
    normalizedName: normalize("Asha Devi"),
    variants: ["ashu", "asha"]
    ,sourceCount: 0

  },
  {
    id: 2,
    canonicalName: "Rahul Varma",
    normalizedName: normalize("Rahul Varma"),
    variants: ["rahul", "rahool"]
    ,sourceCount: 0
  },
  {
    id: 3,
    canonicalName: "Ashok Kumar",
    normalizedName: normalize("Ashok Kumar"),
    variants: ["ashok", "ashok anna"]
    ,sourceCount: 0
  },
  {
    id: 4,
    canonicalName: "Ravi Shankar",
    normalizedName: normalize("Ravi Shankar"),
    variants: ["ravi"]
    ,sourceCount: 0
  }
];
