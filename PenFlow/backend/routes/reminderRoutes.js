const express = require("express");
const router = express.Router();
const Reminder = require("../models/ReminderSettings");

router.get("/:userId", async (req, res) => {
  const settings = await Reminder.findOne({ userId: req.params.userId });
  res.json(settings);
});

router.post("/", async (req, res) => {
  const settings = await Reminder.findOneAndUpdate(
    { userId: req.body.userId },
    req.body,
    { new: true, upsert: true }
  );

  res.json(settings);
});

module.exports = router;