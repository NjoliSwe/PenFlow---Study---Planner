
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

## Clone Repository

```bash
git clone https://github.com/NjoliSwe/PenFlow---Study---Planner.git
```

## Open Backend

```bash
cd backend
npm install
```

## Start Server

```bash
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

## Run Frontend

Open frontend using Live Server.

---

# Deployment Workflow

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


