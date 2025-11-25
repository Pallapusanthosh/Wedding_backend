const driver = require("../db/neo");
const normalize = require("../utils/normalize");

module.exports = {
  async createPerson(name) {
    const id = Date.now().toString().slice(-6); // 6-digit ID
    const session = driver.session();
    try {
      const res = await session.run(
        `
        MERGE (p:Person {id:$id})
        SET p.name=$name, p.normalized=$norm
        RETURN p
        `,
        { id, name, norm: normalize(name) }
      );
      return res.records[0].get("p").properties;
    } finally {
      await session.close();
    }
  }
};
