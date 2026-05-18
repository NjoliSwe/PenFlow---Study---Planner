
# PenFlow – AI-Powered Study Planner

PenFlow is a web-based study planning system designed to help students organize courses, deadlines, study sessions, reminders, and academic progress in one platform.

The system automatically generates study plans based on availability and deadlines, tracks productivity, provides reminders, and integrates AI-generated study advice using Google Gemini AI.

---

# Live Deployment

The system is already hosted and accessible online.

Frontend (Netlify):

https://dynamic-pothos-cef09f.netlify.app

Backend (Render):

https://penflow-study-planner.onrender.com

---

# Demo Account (For Evaluation)

Use this account during testing or demonstrations:

Email:
penflow7@gmail.com


Password:
PenFlow7@


The account already includes:

- Sample courses
- Deadlines
- Generated study plans
- Study sessions
- Progress statistics
- Reminder settings
- AI recommendations

This avoids creating a new account during demonstrations.

---
# MangoDB Atlas Account
Email: 
abdullahnajla73@gmail.com

Password:
Njoli@20066
---
# Main Features

## Authentication
- User signup
- User login
- Personalized data storage

## Course Management
- Add courses
- Edit courses
- Delete courses
- Course color customization

## Deadline Management
- Add assignments
- Add quizzes
- Add exams
- Add projects
- Set priorities
- Mark completion

## Study Plan Generation
- Automatic weekly study plans
- Availability-based scheduling
- Deadline prioritization

## Progress Tracking
- Completion statistics
- Study hours calculation
- Missed sessions
- Productivity monitoring

## Auto Rescheduling
Missed sessions are automatically rescheduled into future available slots.

## Reminder System
- Study reminders
- Deadline reminders
- Custom reminder settings

### Reminder Settings Note

To save reminder preferences in the database, the user must open the **Reminders** page, go to **Settings**, and click **Save Settings**.  
After saving, the reminder settings will be stored in MongoDB and loaded again when the user returns to the page.



## AI Study Advice
Using Google Gemini AI:

- Course prioritization suggestions
- Productivity recommendations
- Study workload balancing

---

# Tech Stack

## Frontend
- HTML
- CSS
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB Atlas
- Mongoose

## AI Integration
- Google Generative AI SDK
- Gemini API

## Tools
- Visual Studio Code
- npm
- Terminal
- Thunder Client
- GitHub

## Hosting Services
Frontend:

Netlify

Backend:

Render

Database:

MongoDB Atlas

---

# System Architecture

User

↓

Frontend (Netlify)

HTML + CSS + JavaScript

↓

Backend API Server (Render)

Node.js + Express.js

↓

MongoDB Atlas Database

↓

Google Gemini AI API

↓

AI Advice / Responses

---

# Project Structure

```text
PenFlow
│
├── backend/
│   │
│   ├── models/
│   │     User.js
│   │     Course.js
│   │     Deadline.js
│   │     StudySession.js
│   │     Availability.js
│   │     ReminderSettings.js
│   │
│   ├── routes/
│   │     authRoutes.js
│   │     courseRoutes.js
│   │     deadlineRoutes.js
│   │     availabilityRoutes.js
│   │     studySessionRoutes.js
│   │     reminderRoutes.js
│   │     aiRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   │
│   ├── html files
│   │
│   │     
│   │
│   ├── css/
│   │
│   ├── js/
│   │    
│   │     
│   │
│   └── assets/
│
├── README.md
└── .gitignore
```

---

# Database Collections

PenFlow stores data in MongoDB Atlas using:

- Users
- Courses
- Deadlines
- StudySessions
- Availability
- ReminderSettings

Relationships are maintained using:

```text
userId
courseId
rescheduledFromId
```

---

# Environment Variables

Create `.env` inside backend:

```env
PORT=5000

MONGO_URI=

GEMINI_API_KEY=
```

Do NOT upload `.env` to GitHub.

---

# Running Locally (Optional)

The project is already hosted online and does not require local setup.

If running locally:

## 1.Download the project ZIP file and extract (unzip) it, or clone the repository. 

```bash
 git clone https://github.com/NjoliSwe/PenFlow---Study---Planner.git
```

## 2.Open the project folder:

```bash
cd PenFlow
```

## 3.Install backend dependencies:

```bash
cd backend
npm install
```

Backend runs on:

```text
http://localhost:5000
```

## 4.Make sure .env file inside the backend folder is: 

PORT=5000
MONGO_URI=mongodb+srv://penflow_admin:PenFlowGroup7@penflowcluster.bgy6wlo.mongodb.net/?appName=PenFlowCluster
GEMINI_API_KEY= AIzaSyAIXctFx5ah9xPE7zvtuup29mQY2VH9dyE

## 5.Start the backend server: 

```bash
node server.js
```

## 6.Open the frontend folder and run it using Live Server or localhost. 

Note:
The deployed version of PenFlow uses a backend API hosted on Render:
const API_URL = "https://penflow-study-planner.onrender.com";
If developers run the project locally, this URL in api.js in the frontend folder should be changed to:
const API_URL = "http://localhost:5000";
This allows the frontend to connect to the locally running backend server instead of the deployed Render API.

---

# Deployment Workflow if you cloned the repositry

After modifying code:

```bash
git add .

git commit -m "Update project"

git push
```

Frontend automatically redeploys through Netlify.

Backend automatically redeploys through Render.

---

# Testing

The system was tested using:

- Chrome
- Edge
- Safari

Testing covered:

- Authentication
- CRUD operations
- Study generation
- Reminders
- AI responses
- Database storage

---

# Authors

Developed by:

SWE381 Girls - Group 7

Software Engineering Department

King Saud University
fall 2026


