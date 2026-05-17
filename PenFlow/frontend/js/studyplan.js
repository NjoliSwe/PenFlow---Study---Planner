

let sessions = [];
let courses = [];
let deadlines = [];
let availability = [];

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const generateBtn = document.getElementById("generateBtn");
const planContent = document.getElementById("planContent");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseLocalDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function formatDateLabel(s) {
  return parseLocalDate(s).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function normalizeSlot(slot) {
  if (!slot || !slot.startTime || !slot.endTime) return null;

  if (typeof slot.dayOfWeek === "number") return slot;

  if (typeof slot.day === "string") {
    const idx = DAY_NAMES.indexOf(slot.day);

    if (idx >= 0) {
      return {
        _id: slot._id,
        dayOfWeek: idx,
        startTime: slot.startTime,
        endTime: slot.endTime
      };
    }
  }

  return null;
}

function normalizeSession(session) {
  if (!session || !session.courseId || !session.startTime || !session.endTime) return null;

  let scheduledDate = session.scheduledDate;

  if (!scheduledDate && session.day) {
    const idx = DAY_NAMES.indexOf(session.day);

    if (idx >= 0) {
      scheduledDate = formatLocalDate(addDays(getWeekStart(), idx));
    }
  }

  if (!scheduledDate) return null;

  const course = courses.find(course => course._id === session.courseId);
  const baseTitle = course ? `Study: ${course.name}` : session.title || "Study Session";

  return {
    _id: session._id,
    courseId: session.courseId,
    title: session.isRescheduled ? `${baseTitle} (Rescheduled)` : baseTitle,
    scheduledDate,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status === "pending" ? "scheduled" : session.status || "scheduled",
    isRescheduled: Boolean(session.isRescheduled),
    rescheduledFromId: session.rescheduledFromId || null
  };
}

async function refreshData() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  deadlines = await getDeadlines(currentUser._id);

  const rawAvailability = await getAvailability(currentUser._id);
  availability = rawAvailability.map(normalizeSlot).filter(Boolean);

  const rawSessions = await getStudySessions(currentUser._id);
  const validCourseIds = courses.map(course => course._id);

  sessions = rawSessions
    .map(normalizeSession)
    .filter(session => session && validCourseIds.includes(session.courseId));
}

function saveSessions() {
  try {
    window.dispatchEvent(new CustomEvent("penflow-sessions-updated"));
  } catch (error) {}
}

function getCourseWeights() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return courses.map(course => {
    const courseDeadlines = deadlines
      .filter(deadline => deadline.courseId === course._id && !deadline.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    let urgencyScore = 0;

    courseDeadlines.forEach(deadline => {
      const days = Math.ceil(
        (new Date(deadline.dueDate + "T00:00:00") - today) / 86400000
      );

      const priorityBonus =
        deadline.priority === "high" ? 3 :
        deadline.priority === "medium" ? 1 :
        0;

      const typeBonus =
        deadline.type === "exam" ? 3 :
        deadline.type === "project" ? 1 :
        0;

      if (days <= 7 && days >= 0) {
        urgencyScore += (8 - days) + priorityBonus + typeBonus;
      }
    });

    return {
      course,
      urgencyScore
    };
  }).sort((a, b) => b.urgencyScore - a.urgencyScore);
}

function buildSessionsForSlot(slot, currentDate, courseWeights, courseIndexRef) {
  const result = [];
  const startMins = timeToMinutes(slot.startTime);
  const endMins = timeToMinutes(slot.endTime);

  if (endMins <= startMins) return result;

  let cursor = startMins;

  while (cursor < endMins) {
    const courseWeight = courseWeights[courseIndexRef.value % courseWeights.length];
    const remaining = endMins - cursor;
    const duration = remaining >= 60 ? 60 : remaining;

    result.push({
      courseId: courseWeight.course._id,
      title: `Study: ${courseWeight.course.name}`,
      scheduledDate: formatLocalDate(currentDate),
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(cursor + duration),
      status: "scheduled",
      isRescheduled: false,
      rescheduledFromId: null
    });

    cursor += duration;
    courseIndexRef.value++;
  }

  return result;
}

async function generatePlan() {
  await refreshData();

  if (courses.length === 0) {
    alert("Please add courses first.");
    return;
  }

  if (availability.length === 0) {
    alert("Please add your availability first.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  const weekStart = getWeekStart();
  const weekEnd = addDays(weekStart, 7);

  const thisWeekScheduledSessions = sessions.filter(session => {
    if (!session.scheduledDate) return false;

    const date = parseLocalDate(session.scheduledDate);

    return date >= weekStart && date < weekEnd && session.status === "scheduled";
  });

  for (const session of thisWeekScheduledSessions) {
    await deleteStudySessionFromDB(session._id);
  }

  await refreshData();

  const courseWeights = getCourseWeights();
  const courseIndexRef = { value: 0 };
  const newSessions = [];

  for (let offset = 0; offset < 7; offset++) {
    const currentDate = addDays(weekStart, offset);
    const dayOfWeek = currentDate.getDay();

    const daySlots = [...availability.filter(slot => slot.dayOfWeek === dayOfWeek)]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    daySlots.forEach(slot => {
      newSessions.push(...buildSessionsForSlot(slot, currentDate, courseWeights, courseIndexRef));
    });
  }

  for (const session of newSessions) {
    await addStudySessionToDB({
      userId: currentUser._id,
      ...session
    });
  }

  await refreshData();
  saveSessions();

  generateBtn.disabled = false;
  generateBtn.textContent = "✨ Generate Plan";

  await renderPlan();

  alert(`Generated ${newSessions.length} study sessions!`);
}

async function updateStatus(id, status) {
  await updateStudySessionInDB(id, {
    status
  });

  await refreshData();
  saveSessions();

  if (status === "missed") {
    await reschedule(id);
  } else {
    await renderPlan();
  }
}

async function reschedule(missedId) {
  await refreshData();

  const missed = sessions.find(session => session._id === missedId);

  if (!missed) {
    await renderPlan();
    return;
  }

  const occupied = new Set(
    sessions
      .filter(session => session.status !== "missed")
      .map(session => `${session.scheduledDate}|${session.startTime}`)
  );

  const alreadyRescheduled = sessions.some(
    session => session.rescheduledFromId === missedId
  );

  if (alreadyRescheduled) {
    await renderPlan();
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rescheduled = null;

  for (let offset = 1; offset <= 14 && !rescheduled; offset++) {
    const futureDate = addDays(today, offset);
    const futureDOW = futureDate.getDay();
    const futureDateStr = formatLocalDate(futureDate);

    const daySlots = [...availability.filter(slot => slot.dayOfWeek === futureDOW)]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const slot of daySlots) {
      const startMins = timeToMinutes(slot.startTime);
      const endMins = timeToMinutes(slot.endTime);

      let cursor = startMins;

      while (cursor + 60 <= endMins) {
        const slotKey = `${futureDateStr}|${minutesToTime(cursor)}`;

        if (!occupied.has(slotKey)) {
          const course = courses.find(course => course._id === missed.courseId);
          const courseName = course ? course.name : "";

          rescheduled = {
            userId: currentUser._id,
            courseId: missed.courseId,
            title: `Study: ${courseName} (Rescheduled)`,
            scheduledDate: futureDateStr,
            startTime: minutesToTime(cursor),
            endTime: minutesToTime(cursor + 60),
            status: "scheduled",
            isRescheduled: true,
            rescheduledFromId: missedId
          };

          occupied.add(slotKey);
          break;
        }

        cursor += 60;
      }

      if (rescheduled) break;
    }
  }

  if (rescheduled) {
    await addStudySessionToDB(rescheduled);
    await refreshData();
    saveSessions();

    alert(`Session rescheduled to ${rescheduled.scheduledDate} at ${rescheduled.startTime}.`);
  } else {
    alert("Session marked as missed. No free slot found in the next 14 days to reschedule.");
  }

  await renderPlan();
}

async function deleteSession(id) {
  await deleteStudySessionFromDB(id);
  await refreshData();
  saveSessions();
  await renderPlan();
}

function applyCourseColors() {
  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.style.setProperty("--course-color", dot.dataset.color);
  });
}

async function renderPlan() {
  await refreshData();

  const weekStart = getWeekStart();
  const weekEnd = addDays(weekStart, 7);
  const validIds = courses.map(course => course._id);

  const weekSessions = sessions
    .filter(session => {
      if (!session.scheduledDate) return false;

      const date = parseLocalDate(session.scheduledDate);

      return date >= weekStart && date < weekEnd && validIds.includes(session.courseId);
    })
    .sort((a, b) => {
      if (a.scheduledDate !== b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }

      return a.startTime.localeCompare(b.startTime);
    });

  const futureSessions = sessions
    .filter(session => {
      if (!session.scheduledDate || !session.isRescheduled) return false;

      const date = parseLocalDate(session.scheduledDate);

      return date >= weekEnd && validIds.includes(session.courseId);
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const allToShow = [...weekSessions, ...futureSessions];

  if (allToShow.length === 0) {
    planContent.innerHTML = `
      <div class="empty-state">
        <p>No study sessions this week. Click "Generate Plan" to create your schedule!</p>
      </div>
    `;
    return;
  }

  const grouped = {};

  allToShow.forEach(session => {
    if (!grouped[session.scheduledDate]) {
      grouped[session.scheduledDate] = [];
    }

    grouped[session.scheduledDate].push(session);
  });

  planContent.innerHTML = Object.entries(grouped)
    .map(([date, daySessions]) => {
      const sessionsHtml = daySessions
        .map(session => {
          const course = courses.find(course => course._id === session.courseId);

          const cardClass = [
            "session-card",
            session.status === "completed" ? "completed" : "",
            session.status === "missed" ? "missed" : ""
          ].filter(Boolean).join(" ");

          return `
            <div class="${cardClass}">
              <div class="session-left">
                <div
                  class="color-dot"
                  data-color="${course?.color || "#02C39A"}">
                </div>

                <div>
                  <p class="session-title">${session.title}</p>
                  <p class="session-meta">
                    ${session.startTime.slice(0, 5)} – ${session.endTime.slice(0, 5)}
                    ${course ? `· ${course.name}` : ""}
                    ${session.isRescheduled ? " · <em>Rescheduled</em>" : ""}
                  </p>
                </div>
              </div>

              <div class="session-right">
                ${
                  session.status === "scheduled"
                    ? `
                      <button
                        class="btn-action btn-done"
                        data-id="${session._id}"
                        data-status="completed">
                        ✓ Done
                      </button>

                      <button
                        class="btn-action btn-missed"
                        data-id="${session._id}"
                        data-status="missed">
                        ✗ Missed
                      </button>

                      <button
                        class="btn-action btn-delete"
                        data-id="${session._id}">
                        Delete
                      </button>
                    `
                    : `
                      <span class="status-badge status-${session.status}">
                        ${session.status}
                      </span>

                      <button
                        class="btn-action btn-delete"
                        data-id="${session._id}">
                        Delete
                      </button>
                    `
                }
              </div>
            </div>
          `;
        })
        .join("");

      const isThisWeek =
        parseLocalDate(date) >= weekStart &&
        parseLocalDate(date) < weekEnd;

      const label = isThisWeek
        ? formatDateLabel(date)
        : `📅 Rescheduled – ${formatDateLabel(date)}`;

      return `
        <div class="day-group">
          <h2 class="day-label">${label}</h2>
          <div class="session-list">${sessionsHtml}</div>
        </div>
      `;
    })
    .join("");

  applyCourseColors();
}

if (generateBtn) {
  generateBtn.addEventListener("click", generatePlan);
}

planContent.addEventListener("click", async function (event) {
  const deleteButton = event.target.closest(".btn-delete");
  const statusButton = event.target.closest(".btn-done, .btn-missed");

  if (deleteButton) {
    await deleteSession(deleteButton.dataset.id);
    return;
  }

  if (statusButton) {
    await updateStatus(statusButton.dataset.id, statusButton.dataset.status);
  }
});

renderPlan();