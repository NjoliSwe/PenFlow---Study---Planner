const express = require("express");
const router = express.Router();
const Availability = require("../models/Availability");

router.get("/:userId", async (req, res) => {
  const slots = await Availability.find({ userId: req.params.userId });
  res.json(slots);
});

router.post("/", async (req, res) => {
  const slot = new Availability(req.body);
  await slot.save();
  res.json(slot);
});

router.delete("/:id", async (req, res) => {
  await Availability.findByIdAndDelete(req.params.id);
  res.json({ message: "Availability deleted" });
});

module.exports = router;