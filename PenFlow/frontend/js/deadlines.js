// deadlines.js — FR3.1 (assignments), FR3.2 (exam dates), FR3.3 (priority sorting)

let deadlines = [];
let courses = [];

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const courseSelect = document.getElementById("courseSelect");
const deadlineTitleInput = document.getElementById("deadlineTitle");
const deadlineTypeSelect = document.getElementById("deadlineType");
const dueDateInput = document.getElementById("dueDate");
const prioritySelect = document.getElementById("priority");
const addDeadlineBtn = document.getElementById("addDeadlineBtn");
const deadlinesContainer = document.getElementById("deadlinesContainer");

let activeFilter = "all";

// ── Persistence ────────────────────────────────────────────────────
async function saveDeadlines() {
  await loadData();
}

async function removeOrphanedDeadlines() {
  const validIds = courses.map(course => course._id);

  for (const deadline of deadlines) {
    if (!validIds.includes(deadline.courseId)) {
      await deleteDeadlineFromDB(deadline._id);
    }
  }

  deadlines = deadlines.filter(deadline => validIds.includes(deadline.courseId));
}

// ── Load data from DB ──────────────────────────────────────────────
async function loadData() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  deadlines = await getDeadlines(currentUser._id);

  await removeOrphanedDeadlines();
  loadCoursesIntoSelect();
  renderDeadlines();
}

// ── Form helpers ───────────────────────────────────────────────────
function loadCoursesIntoSelect() {
  if (courses.length === 0) {
    courseSelect.innerHTML = '<option value="">No courses available</option>';
    courseSelect.disabled = true;
    addDeadlineBtn.disabled = true;
    return;
  }

  courseSelect.disabled = false;
  addDeadlineBtn.disabled = false;

  courseSelect.innerHTML = courses
    .map(course => `<option value="${course._id}">${course.name}</option>`)
    .join("");
}

function clearForm() {
  deadlineTitleInput.value = "";
  dueDateInput.value = "";
  prioritySelect.value = "medium";
  deadlineTypeSelect.value = "assignment";
}

// ── Add deadline ───────────────────────────────────────────────────
async function addDeadline() {
  if (courses.length === 0) {
    alert("Please add courses first.");
    return;
  }

  const courseId = courseSelect.value;
  const title = deadlineTitleInput.value.trim();
  const type = deadlineTypeSelect.value;
  const dueDate = dueDateInput.value;
  const priority = prioritySelect.value;

  if (!courseId || !title || !dueDate) {
    alert("Please fill all fields.");
    return;
  }

  await addDeadlineToDB({
    userId: currentUser._id,
    courseId,
    title,
    type,
    dueDate,
    priority,
    completed: false
  });

  clearForm();
  await saveDeadlines();
}

async function completeDeadline(id) {
  await updateDeadlineInDB(id, {
    completed: true
  });

  await saveDeadlines();
}

async function deleteDeadline(id) {
  if (!confirm("Delete this deadline?")) return;

  await deleteDeadlineFromDB(id);
  await saveDeadlines();
}

// FR3.3
const PRIORITY_WEIGHT = {
  high: 0,
  medium: 1,
  low: 2
};

const TYPE_ICONS = {
  exam: "📝",
  assignment: "📄",
  quiz: "✏️",
  project: "🗂️"
};

function typeBadge(type) {
  const icon = TYPE_ICONS[type] || "📄";
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Task";

  return `<span class="type-badge type-${type}">${icon} ${label}</span>`;
}

function renderDeadlines() {
  const filtered =
    activeFilter === "all"
      ? deadlines
      : deadlines.filter(deadline => deadline.type === activeFilter);

  if (filtered.length === 0) {
    deadlinesContainer.innerHTML = `
      <div class="empty-state">
        <p>${activeFilter === "all" ? "No deadlines added yet." : `No ${activeFilter}s found.`}</p>
      </div>
    `;
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const priorityCompare =
      (PRIORITY_WEIGHT[a.priority] ?? 1) -
      (PRIORITY_WEIGHT[b.priority] ?? 1);

    if (priorityCompare !== 0) return priorityCompare;

    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  deadlinesContainer.innerHTML = sorted.map(deadline => {
    const course = courses.find(course => course._id === deadline.courseId);
    if (!course) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(deadline.dueDate + "T00:00:00");
    const diffMs = due - today;
    const diffDays = Math.round(diffMs / 86400000);

    let urgencyLabel = "";

    if (!deadline.completed) {
      if (diffDays < 0) {
        urgencyLabel = `<span class="urgency overdue">Overdue by ${Math.abs(diffDays)}d</span>`;
      } else if (diffDays === 0) {
        urgencyLabel = `<span class="urgency today">Due Today!</span>`;
      } else if (diffDays <= 3) {
        urgencyLabel = `<span class="urgency soon">In ${diffDays}d</span>`;
      }
    }

    return `
      <div class="deadline-card ${deadline.completed ? "completed" : ""}">
        <div class="deadline-top">
          <div>
            <p class="deadline-title">${deadline.title}</p>
            <p class="deadline-meta">${course.name} · Due: ${deadline.dueDate}</p>
          </div>

          <div class="badge-group">
            ${typeBadge(deadline.type || "assignment")}
            <span class="priority-badge priority-${deadline.priority}">
              ${deadline.priority}
            </span>
            ${urgencyLabel}
          </div>
        </div>

        <div class="deadline-actions">
          ${
            deadline.completed
              ? '<span class="completed-label">✓ Completed</span>'
              : `
                <button
                  class="complete-btn"
                  data-id="${deadline._id}">
                  Mark Complete
                </button>
              `
          }

          <button
            class="delete-btn"
            data-id="${deadline._id}">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Filter tabs
document.getElementById("filterTabs").addEventListener("click", function (event) {
  const tab = event.target.closest(".filter-tab");

  if (!tab) return;

  document.querySelectorAll(".filter-tab").forEach(button => {
    button.classList.remove("active");
  });

  tab.classList.add("active");
  activeFilter = tab.dataset.filter;

  renderDeadlines();
});

deadlinesContainer.addEventListener("click", async function (event) {
  const id = event.target.dataset.id;

  if (!id) return;

  if (event.target.classList.contains("complete-btn")) {
    await completeDeadline(id);
    return;
  }

  if (event.target.classList.contains("delete-btn")) {
    await deleteDeadline(id);
    return;
  }
});

addDeadlineBtn.addEventListener("click", addDeadline);

loadData();