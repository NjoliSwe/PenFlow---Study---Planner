let courses = [];
let deadlines = [];
let sessions = [];

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const courseCount = document.getElementById("courseCount");
const deadlineCount = document.getElementById("deadlineCount");
const sessionCount = document.getElementById("sessionCount");
const nextDeadlineBox = document.getElementById("nextDeadline");
const todaySessionsBox = document.getElementById("todaySessions");

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekEnd() {
  return addDays(getWeekStart(), 7);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayLocalString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadHomeData() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  deadlines = await getDeadlines(currentUser._id);
  sessions = await getStudySessions(currentUser._id);
}

function getCurrentWeekSessions() {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  return sessions
    .filter(session => {
      if (!session.scheduledDate) return false;

      const sessionDate = parseLocalDate(session.scheduledDate);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    })
    .sort((a, b) => {
      if (a.scheduledDate !== b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }

      return a.startTime.localeCompare(b.startTime);
    });
}

function getSessionTitle(session, course) {
  if (!course) return session.title || "Study Session";

  return session.isRescheduled
    ? `Study: ${course.name} (Rescheduled)`
    : `Study: ${course.name}`;
}

function formatDate(dateString) {
  const date = parseLocalDate(dateString);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function renderCounts() {
  const currentWeekSessions = getCurrentWeekSessions();

  if (courseCount) courseCount.textContent = courses.length;
  if (deadlineCount) deadlineCount.textContent = deadlines.length;
  if (sessionCount) sessionCount.textContent = currentWeekSessions.length;
}

function renderNextDeadline() {
  if (!nextDeadlineBox) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDeadlines = deadlines
    .filter(deadline => !deadline.completed && parseLocalDate(deadline.dueDate) >= today)
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

  if (upcomingDeadlines.length === 0) {
    nextDeadlineBox.innerHTML = `<p class="muted-text">No upcoming deadlines.</p>`;
    return;
  }

  const next = upcomingDeadlines[0];
  const course = courses.find(course => course._id === next.courseId);

  if (!course) {
    nextDeadlineBox.innerHTML = `<p class="muted-text">No upcoming deadlines.</p>`;
    return;
  }

  nextDeadlineBox.innerHTML = `
    <div class="info-card-content">
      <h3>${next.title}</h3>
      <p>${course.name}</p>
      <span class="info-date">Due: ${formatDate(next.dueDate)}</span>
    </div>
  `;
}

function renderTodaySessions() {
  if (!todaySessionsBox) return;

  const todayStr = getTodayLocalString();

  const todaySessions = getCurrentWeekSessions()
    .filter(session => session.scheduledDate === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaySessions.length === 0) {
    todaySessionsBox.innerHTML = `<p class="muted-text">No study sessions for today.</p>`;
    return;
  }

  todaySessionsBox.innerHTML = todaySessions.map(session => {
    const course = courses.find(course => course._id === session.courseId);
    if (!course) return "";

    return `
      <div class="today-session-item">
        <div>
          <p class="session-name">${getSessionTitle(session, course)}</p>
          <p class="session-course">${course.name}</p>
        </div>
        <span class="session-time">
          ${session.startTime.slice(0, 5)} - ${session.endTime.slice(0, 5)}
        </span>
      </div>
    `;
  }).join("");
}

async function renderHomePage() {
  await loadHomeData();

  renderCounts();
  renderNextDeadline();
  renderTodaySessions();
}

window.addEventListener("focus", renderHomePage);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    renderHomePage();
  }
});

renderHomePage();