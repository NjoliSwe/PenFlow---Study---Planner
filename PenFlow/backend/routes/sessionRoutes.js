const express = require("express");
const router = express.Router();
const StudySession = require("../models/StudySession");

router.get("/:userId", async (req, res) => {
  const sessions = await StudySession.find({ userId: req.params.userId });
  res.json(sessions);
});

router.post("/", async (req, res) => {
  const session = new StudySession(req.body);
  await session.save();
  res.json(session);
});

router.post("/many", async (req, res) => {
  const sessions = await StudySession.insertMany(req.body.sessions);
  res.json(sessions);
});

router.put("/:id", async (req, res) => {
  const updated = await StudySession.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await StudySession.findByIdAndDelete(req.params.id);
  res.json({ message: "Session deleted" });
});

module.exports = router;