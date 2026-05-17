let deadlines = [];
let sessions = [];
let courses = [];

let reminderSettings = {
  studyReminderMinutes: 15,
  deadlineReminderDays: 1
};

let sentReminderIds = JSON.parse(localStorage.getItem("sentReminderIds") || "[]");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const remindersList = document.getElementById("remindersList");
const requestPermissionBtn = document.getElementById("requestPermissionBtn");
const refreshBtn = document.getElementById("refreshBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const settingsToggleBtn = document.getElementById("settingsToggleBtn");
const settingsCard = document.getElementById("settingsCard");
const studyReminderMinutes = document.getElementById("studyReminderMinutes");
const deadlineReminderDays = document.getElementById("deadlineReminderDays");
const userName = document.getElementById("userName");

if (currentUser && userName) {
  userName.textContent = currentUser.fullName || "Student";
}

async function refreshData() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  deadlines = await getDeadlines(currentUser._id);
  sessions = await getStudySessions(currentUser._id);

  const savedSettings = await getReminderSettings(currentUser._id);

  reminderSettings = savedSettings || {
    studyReminderMinutes: 15,
    deadlineReminderDays: 1
  };
}

function getCourse(courseId) {
  return courses.find(course => course._id === courseId);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatDisplayTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getDeadlineDateTime(deadline) {
  return new Date(`${deadline.dueDate}T23:59:00`);
}

function getSessionDateTime(session) {
  return new Date(`${session.scheduledDate}T${session.startTime}:00`);
}

function getSessionTitle(session) {
  const course = getCourse(session.courseId);

  if (!course) return null;

  return session.isRescheduled
    ? `Study: ${course.name} (Rescheduled)`
    : `Study: ${course.name}`;
}

async function loadReminderSettingsIntoForm() {
  await refreshData();

  studyReminderMinutes.value = String(reminderSettings.studyReminderMinutes);
  deadlineReminderDays.value = String(reminderSettings.deadlineReminderDays);
}

function toggleSettings() {
  settingsCard.classList.toggle("hidden");

  if (!settingsCard.classList.contains("hidden")) {
    loadReminderSettingsIntoForm();
  }
}

function closeSettings() {
  settingsCard.classList.add("hidden");
}

async function getUpcomingReminders() {
  await refreshData();

  const now = new Date();
  const upcoming = [];

  deadlines
    .filter(deadline => !deadline.completed)
    .forEach(deadline => {
      const dueDate = getDeadlineDateTime(deadline);

      const reminderTime = new Date(
        dueDate.getTime() -
          reminderSettings.deadlineReminderDays * 24 * 60 * 60 * 1000
      );

      if (dueDate >= now && getCourse(deadline.courseId)) {
        upcoming.push({
          id: `deadline-${deadline._id}`,
          deadlineType: deadline.type || "assignment",
          type: "deadline",
          title: deadline.title,
          courseId: deadline.courseId,
          eventTime: dueDate,
          reminderTime,
          detail: `Due ${formatDate(dueDate)}`
        });
      }
    });

  sessions
    .filter(session => session.status === "scheduled")
    .forEach(session => {
      const course = getCourse(session.courseId);

      if (!course) return;

      const sessionTime = getSessionDateTime(session);

      const reminderTime = new Date(
        sessionTime.getTime() -
          reminderSettings.studyReminderMinutes * 60 * 1000
      );

      if (sessionTime >= now) {
        upcoming.push({
          id: `session-${session._id}`,
          type: "session",
          title: getSessionTitle(session),
          courseId: session.courseId,
          eventTime: sessionTime,
          reminderTime,
          detail: `${formatDate(sessionTime)} · ${formatDisplayTime(session.startTime)} - ${formatDisplayTime(session.endTime)}`
        });
      }
    });

  return upcoming.sort((a, b) => a.eventTime - b.eventTime);
}

function sendBrowserReminder(reminder) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (sentReminderIds.includes(reminder.id)) return;

  const course = getCourse(reminder.courseId);
  if (!course) return;

  const body =
    reminder.type === "deadline"
      ? `${course.name} • ${reminder.title} is coming up.`
      : `${course.name} • ${reminder.title} starts soon.`;

  new Notification("PenFlow Reminder", { body });

  sentReminderIds.push(reminder.id);
  localStorage.setItem("sentReminderIds", JSON.stringify(sentReminderIds));
}

function renderReminderCards(items, emptyText) {
  if (!items.length) {
    return `<div class="group-empty">${emptyText}</div>`;
  }

  return items.map(reminder => {
    const course = getCourse(reminder.courseId);
    if (!course) return "";

    const badgeClass =
      reminder.type === "deadline" ? "badge-deadline" : "badge-session";

    const typeLabel = reminder.deadlineType || "deadline";

    const badgeLabel =
      reminder.type === "deadline" ? typeLabel : "study session";

    return `
      <div class="reminder-card">
        <div class="reminder-left">
          <div class="color-dot" data-color="${course.color || "#02C39A"}"></div>

          <div>
            <p class="reminder-title">${reminder.title}</p>
            <p class="reminder-meta">${course.name}</p>
          </div>
        </div>

        <div class="reminder-right">
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          <span class="badge badge-time">${reminder.detail}</span>
        </div>
      </div>
    `;
  }).join("");
}

function applyCourseColors() {
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.style.setProperty("--course-color", dot.dataset.color);
  });
}

async function renderReminders() {
  const reminders = await getUpcomingReminders();

  const sessionReminders = reminders.filter(reminder => reminder.type === "session");
  const deadlineReminders = reminders.filter(reminder => reminder.type === "deadline");

  if (reminders.length === 0) {
    remindersList.innerHTML = `
      <div class="empty-state">
        <p>No upcoming reminders found yet.</p>
      </div>
    `;
    return;
  }

  remindersList.innerHTML = `
    <div class="reminder-groups">
      <section class="reminder-group">
        <div class="group-header">
          <h3>Study Session Reminders</h3>
          <span class="group-count">${sessionReminders.length}</span>
        </div>

        <div class="group-list">
          ${renderReminderCards(sessionReminders, "No upcoming study session reminders.")}
        </div>
      </section>

      <section class="reminder-group">
        <div class="group-header">
          <h3>Deadline Reminders</h3>
          <span class="group-count">${deadlineReminders.length}</span>
        </div>

        <div class="group-list">
          ${renderReminderCards(deadlineReminders, "No upcoming deadline reminders.")}
        </div>
      </section>
    </div>
  `;

  applyCourseColors();
  checkDueNotifications(reminders);
}

function checkDueNotifications(reminders = []) {
  const now = new Date();

  reminders.forEach(reminder => {
    const isDue =
      now >= reminder.reminderTime &&
      now <= new Date(reminder.eventTime.getTime() + 60 * 1000);

    if (isDue) {
      sendBrowserReminder(reminder);
    }
  });
}

settingsToggleBtn.addEventListener("click", () => {
  toggleSettings();
});

requestPermissionBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    alert("Notifications enabled successfully.");
  } else {
    alert("Notification permission was not granted.");
  }
});

saveSettingsBtn.addEventListener("click", async () => {
  reminderSettings = {
    userId: currentUser._id,
    studyReminderMinutes: Number(studyReminderMinutes.value),
    deadlineReminderDays: Number(deadlineReminderDays.value)
  };

  await saveReminderSettingsToDB(reminderSettings);

  await renderReminders();
  closeSettings();

  alert("Reminder settings saved.");
});

refreshBtn.addEventListener("click", () => {
  renderReminders();
});

closeSettings();
renderReminders();

setInterval(async () => {
  const reminders = await getUpcomingReminders();
  checkDueNotifications(reminders);
}, 30000);