// progress.js — FR6.1, FR6.2

let courses = [];
let sessions = [];

const user = JSON.parse(localStorage.getItem("currentUser") || "null");

const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user?.fullName || "Student";

const statsRow = document.getElementById("statsRow");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const courseSection = document.getElementById("courseProgressSection");

function getDurationHours(session) {
  if (!session.startTime || !session.endTime) return 0;

  const [sh, sm] = session.startTime.split(":").map(Number);
  const [eh, em] = session.endTime.split(":").map(Number);

  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}

async function loadProgressData() {
  if (!user || !user._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(user._id);
  sessions = await getStudySessions(user._id);

  const validIds = courses.map(course => course._id);

  sessions = sessions.filter(
    session => session && session.courseId && validIds.includes(session.courseId)
  );
}

function renderPerCourseBreakdown() {
  if (courses.length === 0) return "";

  return courses.map(course => {
    const courseSessions = sessions.filter(session => session.courseId === course._id);
    const completedCount = courseSessions.filter(session => session.status === "completed").length;

    const completedHours = courseSessions
      .filter(session => session.status === "completed")
      .reduce((sum, session) => sum + getDurationHours(session), 0);

    const percent =
      courseSessions.length > 0
        ? Math.round((completedCount / courseSessions.length) * 100)
        : 0;

    return `
      <div class="course-progress-row">
        <div class="course-progress-header">
          <span class="course-dot" data-color="${course.color || "#02C39A"}"></span>

          <span class="course-progress-name">
            ${course.name}
          </span>

          <span class="course-progress-stats">
            ${completedCount}/${courseSessions.length} sessions · ${completedHours.toFixed(1)}h
          </span>
        </div>

        <div class="progress-bar-track">
          <div
            class="progress-bar-fill course-progress-fill"
            data-width="${percent}"
            data-color="${course.color || "#02C39A"}">
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function applyProgressStyles() {
  document.querySelectorAll(".course-dot").forEach(dot => {
    dot.style.setProperty("--course-color", dot.dataset.color);
  });

  document.querySelectorAll(".course-progress-fill").forEach(fill => {
    fill.style.setProperty("--progress-width", fill.dataset.width + "%");
    fill.style.setProperty("--course-color", fill.dataset.color);
  });
}

async function renderProgress() {
  await loadProgressData();

  const completed = sessions.filter(session => session.status === "completed").length;
  const missed = sessions.filter(session => session.status === "missed").length;
  const total = sessions.length;
  const pending = total - completed - missed;

  const totalHours = sessions
    .filter(session => session.status === "completed")
    .reduce((sum, session) => sum + getDurationHours(session), 0);

  if (statsRow) {
    statsRow.innerHTML = `
      <div class="stat-card">
        <div class="stat-title">Total Sessions</div>
        <div class="stat-value">${total}</div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Completed</div>
        <div class="stat-value stat-success">${completed}</div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Missed</div>
        <div class="stat-value stat-danger">${missed}</div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Pending</div>
        <div class="stat-value">${pending}</div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Study Hours</div>
        <div class="stat-value stat-info">${totalHours.toFixed(1)}h</div>
      </div>
    `;
  }

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (progressPercent) {
    progressPercent.textContent = percent + "%";
  }

  if (progressFill) {
    progressFill.style.setProperty("--progress-width", percent + "%");
  }

  if (courseSection) {
    courseSection.innerHTML = renderPerCourseBreakdown();
  }

  applyProgressStyles();
}

renderProgress();