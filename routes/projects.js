// routes/projects.js
const express = require("express");
const router = express.Router();
const driver = require("../db/neo")

// Create project node
router.post("/", async (req, res) => {
  const session = driver.session();
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "project id required" });

    await session.run(
      `MERGE (pr:Project {id:$id}) RETURN pr`,
      { id }
    );

    res.json({ message: "Project created", id });

  } catch (err) {
    console.error("Project error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// Assign role (Bride/Groom) to person
router.post("/assign-role", async (req, res) => {
  const session = driver.session();
  try {
    const { personId, projectId, role } = req.body;

    if (!personId || !projectId || !role)
      return res.status(400).json({ error: "personId projectId role required" });

    await session.run(
      `
      MATCH (p:Person {id:$personId}), (pr:Project {id:$projectId})
      MERGE (p)-[r:BELONGS_TO {role:$role}]->(pr)
      SET r.assignedAt = timestamp()
      `,
      { personId, projectId, role }
    );

    res.json({ message: `Role '${role}' assigned` });

  } catch (err) {
    console.error("Assign role error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

module.exports = router;
