// statistics.js — FR8.1 (weekly study hours), FR8.2 (progress trends)

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const userNameEl = document.getElementById("userName");
if (currentUser && userNameEl) userNameEl.textContent = currentUser.fullName || "Student";

const statsRow = document.getElementById("statsRow");
const chartsArea = document.getElementById("chartsArea");

let activeCharts = [];
let courses = [];
let sessions = [];

// ── Helpers ────────────────────────────────────────────────────────
function parseLocalDate(s) {
  if (!s) return null;

  const parts = s.split("-").map(Number);

  if (parts.length !== 3 || parts.some(isNaN)) return null;

  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// FIX: use actual time strings for precise duration
function getSessionDurationHours(session) {
  if (!session.startTime || !session.endTime) return 0;

  const [sh, sm] = session.startTime.split(":").map(Number);
  const [eh, em] = session.endTime.split(":").map(Number);

  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}

async function loadStatisticsData() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  sessions = await getStudySessions(currentUser._id);

  const validCourseIds = courses.map(course => course._id);

  sessions = sessions.filter(session => {
    return session && session.courseId && validCourseIds.includes(session.courseId);
  });
}

// ── Chart management ───────────────────────────────────────────────
function destroyCharts() {
  activeCharts.forEach(chart => chart.destroy());
  activeCharts = [];
}

function statCard(label, value, icon, iconClass) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${iconClass}">${icon}</div>
      <p class="stat-value">${value}</p>
      <p class="stat-label">${label}</p>
    </div>`;
}

// ── FR8.1: Weekly hours ────────────────────────────────────────────
function getWeeklyHours(sessionsList) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return sessionsList
    .filter(session => session.status === "completed" && session.scheduledDate)
    .reduce((sum, session) => {
      const date = parseLocalDate(session.scheduledDate);

      if (date >= weekStart && date < weekEnd) {
        return sum + getSessionDurationHours(session);
      }

      return sum;
    }, 0);
}

// ── Render ─────────────────────────────────────────────────────────
async function renderStatistics() {
  if (!statsRow || !chartsArea) return;

  await loadStatisticsData();

  destroyCharts();

  const total = sessions.length;
  const completed = sessions.filter(session => session.status === "completed").length;
  const missed = sessions.filter(session => session.status === "missed").length;
  const pending = sessions.filter(
    session => session.status === "scheduled" || session.status === "pending"
  ).length;

  const totalHours = sessions
    .filter(session => session.status === "completed")
    .reduce((sum, session) => sum + getSessionDurationHours(session), 0);

  const weeklyHours = getWeeklyHours(sessions);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  statsRow.innerHTML =
    statCard("Total Study Hours", `${totalHours.toFixed(1)}h`, "⏱", "icon-primary") +
    statCard("This Week", `${weeklyHours.toFixed(1)}h`, "📅", "icon-warning") +
    statCard("Completed", `${completed}/${total}`, "📊", "icon-success") +
    statCard("Missed", `${missed}`, "❌", "icon-danger");

  if (total === 0) {
    chartsArea.innerHTML = `
      <div class="chart-message">
        Generate a study plan and complete some sessions to see statistics.
      </div>`;
    return;
  }

  chartsArea.innerHTML = `
    <div class="charts-grid">
      <div class="chart-card">
        <h2>Sessions by Status</h2>
        <canvas id="statusChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Hours per Course</h2>
        <canvas id="courseChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Study Hours by Day</h2>
        <canvas id="dayChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Weekly Completion Trend</h2>
        <canvas id="trendChart"></canvas>
      </div>
    </div>`;

  drawStatusChart(completed, pending, missed);
  drawCourseChart(courses, sessions);
  drawDayChart(sessions);
  drawTrendChart(sessions);
}

function drawStatusChart(completed, pending, missed) {
  const ctx = document.getElementById("statusChart");

  if (!ctx) return;

  activeCharts.push(new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Scheduled", "Missed"],
      datasets: [{
        data: [completed, pending, missed],
        backgroundColor: ["#02C39A", "#f5a623", "#e43451"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  }));
}

function drawCourseChart(coursesList, sessionsList) {
  const labels = [];
  const data = [];
  const colors = [];

  coursesList.forEach(course => {
    labels.push(course.code || course.name);
    colors.push(course.color || "#02C39A");

    const hours = sessionsList
      .filter(session => session.courseId === course._id && session.status === "completed")
      .reduce((sum, session) => sum + getSessionDurationHours(session), 0);

    data.push(parseFloat(hours.toFixed(2)));
  });

  const ctx = document.getElementById("courseChart");

  if (!ctx) return;

  activeCharts.push(new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Hours",
        data,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }));
}

// FR8.1 — hours by day of week
function drawDayChart(sessionsList) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data = [0, 0, 0, 0, 0, 0, 0];

  sessionsList.forEach(session => {
    if (session.status !== "completed") return;

    const date = parseLocalDate(session.scheduledDate);

    if (!date) return;

    data[date.getDay()] = parseFloat(
      (data[date.getDay()] + getSessionDurationHours(session)).toFixed(2)
    );
  });

  const ctx = document.getElementById("dayChart");

  if (!ctx) return;

  activeCharts.push(new Chart(ctx, {
    type: "bar",
    data: {
      labels: dayNames,
      datasets: [{
        label: "Hours",
        data,
        backgroundColor: "#028090",
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }));
}

// FR8.2 — completion trend by day of week
function drawTrendChart(sessionsList) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = dayNames.map((_, index) => {
    const daySessions = sessionsList.filter(session => {
      const date = parseLocalDate(session.scheduledDate);
      return date && date.getDay() === index;
    });

    const completedDay = daySessions.filter(session => session.status === "completed").length;

    return daySessions.length > 0
      ? Math.round((completedDay / daySessions.length) * 100)
      : 0;
  });

  const ctx = document.getElementById("trendChart");

  if (!ctx) return;

  activeCharts.push(new Chart(ctx, {
    type: "line",
    data: {
      labels: dayNames,
      datasets: [{
        label: "Completion %",
        data,
        borderColor: "#02C39A",
        backgroundColor: "rgba(2,195,154,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: value => value + "%"
          }
        }
      }
    }
  }));
}

// ── Init ───────────────────────────────────────────────────────────
renderStatistics();

window.addEventListener("focus", renderStatistics);
window.addEventListener("penflow-sessions-updated", renderStatistics);