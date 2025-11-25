// routes/titles.js
const express = require("express");
const router = express.Router();
const titleService = require("../services/titleservice");

// Final title preview
router.get("/project/:projectId/preview", async (req, res) => {
  try {
    const data = await titleService.previewTitles(req.params.projectId);
    res.json(data);

  } catch (err) {
    console.error("Title preview error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
