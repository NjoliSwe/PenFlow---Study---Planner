const express = require("express");
const router = express.Router();

const {GoogleGenerativeAI} = require("@google/generative-ai");

const Course = require("../models/Course");
const Deadline = require("../models/Deadline");
const StudySession = require("../models/StudySession");
const Availability = require("../models/Availability");




const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/study-advice", async (req, res) => {
try{

    const { userId } = req.body;


const courses = await Course.find({userId});
const deadlines = await Deadline.find({userId});
const sessions = await StudySession.find({userId});
const availability = await Availability.find({userId});


    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview"
    });

    const prompt = `
    You are PenFlow's AI study advisor.

    Student Courses: ${courses.map(c => `-${c.name} (${c.code})`).join("\n")}

    Upcoming Deadlines: ${deadlines.map(d => `
        -${d.title} for course (${d.courseId})
        due on: ${d.dueDate}
        priority: ${d.priority}
        completed: ${d.completed}
        `).join("\n")}

    Study Sessions: ${sessions.map(s => `
        -${s.title}
        on: ${s.scheduledDate}
        from: ${s.startTime} to ${s.endTime}
        status: ${s.status}
        `).join("\n")}

    Availability: ${availability.map(a => `
        -d Day: ${a.dayOfWeek}
        from: ${a.startTime} to ${a.endTime}
        `).join("\n")}

        Give me a short and practical study advise.

        consider:
        1.Wich course should be prioritized
        2.whether the study plan looks balanced
        3.Any overloaded days
        4.suggestions for improving productivity

        keep response friendly and concise.
        Do not ask any follow-up questions.
        Do not end with a question.
        Only give direct advice based on the available PenFlow data.
        `;


    const result = await model.generateContent(prompt);

    const response = result.response.text();

    res.json({
        advice: response
    });

}catch(error){
console.log("Gemini Error:", error);

  if(error.status === 429){

    return res.json({
      advice:"AI limit reached for today. Based on your PenFlow data, focus on your nearest deadlines first, balance your study sessions across courses and avoid overloading one day with too many difficult tasks."
    });
  }

  res.status(500).json({
    message: "Failed to Generate AI."
  });

}
})

module.exports = router;