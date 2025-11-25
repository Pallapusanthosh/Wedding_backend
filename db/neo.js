
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    "neo4j://localhost:7687",
    neo4j.auth.basic("neo4j", "santhosh")
);

module.exports = driver;
// const session = driver.session();
// await session.run("MATCH (n) RETURN n");

// async function testConnection() {
//   const session = driver.session();

//   try {
//     const res = await session.run('RETURN "Connected to Neo4j" AS msg');
//     console.log(res.records[0].get('msg'));
//   } catch (err) {
//     console.error('Error:', err);
//   } finally {
//     await session.close();
//     await driver.close();
//   }
// }

// testConnection();