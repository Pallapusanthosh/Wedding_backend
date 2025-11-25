// routes/people.js
const express = require("express");
const router = express.Router();
const personService = require("../services/personservice");

// Create/update a person
router.post("/", async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id || !name)
      return res.status(400).json({ error: "id and name are required" });

    const person = await personService.createOrUpdatePerson(id, name);
    res.json({ message: "Person saved", person });

  } catch (err) {
    console.error("Person error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get a person
router.get("/:id", async (req, res) => {
  try {
    const person = await personService.getPersonById(req.params.id);
    if (!person) return res.status(404).json({ error: "Not found" });

    res.json({ person });
  } catch (err) {
    console.error("Get person error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
