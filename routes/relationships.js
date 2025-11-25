// routes/relationships.js
const express = require("express");
const router = express.Router();
const relationshipService = require("../services/relationshipservice");

// Add relationship (SIBLING, MARRIED, CHILD_OF, etc.)
router.post("/add", async (req, res) => {
  try {
    const { fromId, toId, type } = req.body;

    if (!fromId || !toId || !type)
      return res.status(400).json({ error: "fromId, toId, type required" });

    const rel = await relationshipService.addRelation(fromId, toId, type);
    res.json({ message: "Relationship stored", rel });

  } catch (err) {
    console.error("Relationship error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all relations of a person
router.get("/:id", async (req, res) => {
  try {
    const relations = await relationshipService.getRelations(req.params.id);
    res.json({ personId: req.params.id, relations });

  } catch (err) {
    console.error("Get relation error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
