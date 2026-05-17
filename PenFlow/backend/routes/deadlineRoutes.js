const express = require("express");
const router = express.Router();
const Deadline = require("../models/Deadline");

router.get("/:userId", async (req, res) => {
  const deadlines = await Deadline.find({ userId: req.params.userId });
  res.json(deadlines);
});

router.post("/", async (req, res) => {
  const deadline = new Deadline(req.body);
  await deadline.save();
  res.json(deadline);
});

router.put("/:id", async (req, res) => {
  const updated = await Deadline.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Deadline.findByIdAndDelete(req.params.id);
  res.json({ message: "Deadline deleted" });
});

module.exports = router;