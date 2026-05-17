const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  title: String,
  type: String,
  dueDate: String,
  priority: String,
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Deadline", deadlineSchema);