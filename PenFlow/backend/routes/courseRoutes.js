const express = require("express");
const router = express.Router();

const Course = require("../models/Course");
const Deadline = require("../models/Deadline");
const StudySession = require("../models/StudySession");

router.get("/:userId", async (req, res) => {
  try {
    const courses = await Course.find({
      userId: req.params.userId
    });

    res.json(courses);
  } catch (error) {
    console.log("Get courses error:", error);

    res.status(500).json({
      message: "Failed to load courses"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.log("Add course error:", error);

    res.status(500).json({
      message: "Failed to add course"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.log("Update course error:", error);

    res.status(500).json({
      message: "Failed to update course"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    await Course.findByIdAndDelete(courseId);

    await Deadline.deleteMany({
      courseId
    });

    await StudySession.deleteMany({
      courseId
    });

    res.json({
      message: "Course and related data deleted"
    });
  } catch (error) {
    console.log("Delete course error:", error);

    res.status(500).json({
      message: "Failed to delete course"
    });
  }
});

module.exports = router;