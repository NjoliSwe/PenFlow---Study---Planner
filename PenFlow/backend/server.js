const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();


// ===== CORS FIX =====
app.use((req, res, next) => {

  res.header(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();

});


// ===== JSON =====
app.use(express.json());



// ===== MongoDB =====
mongoose
.connect(process.env.MONGO_URI)

.then(() => {

console.log(
"MongoDB Connected"
);

})

.catch((error)=>{

console.log(
"MongoDB Error:",
error
);

});



// ===== Test =====
app.get("/", (req,res)=>{

res.send(
"PenFlow backend running"
);

});



// ===== Routes =====
app.use(
"/auth",
authRoutes
);

app.use(
"/courses",
courseRoutes
);

app.use(
"/deadlines",
deadlineRoutes
);

app.use(
"/availability",
availabilityRoutes
);

app.use(
"/reminders",
reminderRoutes
);

app.use(
"/sessions",
sessionRoutes
);



// ===== Port =====
const PORT =
process.env.PORT ||
5000;


app.listen(PORT, ()=>{

console.log(
`Server running on port ${PORT}`
);

});