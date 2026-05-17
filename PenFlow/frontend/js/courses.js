let courses = [];

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const courseNameInput = document.getElementById("courseName");
const courseCodeInput = document.getElementById("courseCode");
const courseColorInput = document.getElementById("courseColor");
const submitBtn = document.getElementById("submitBtn");
const coursesContainer = document.getElementById("coursesContainer");

let editingCourseId = null;

async function loadCourses() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  courses = await getCourses(currentUser._id);
  renderCourses();
}

function clearForm() {
  courseNameInput.value = "";
  courseCodeInput.value = "";
  courseColorInput.value = "#02c39a";
  editingCourseId = null;
  submitBtn.textContent = "Add Course";
}

function renderCourses() {
  if (courses.length === 0) {
    coursesContainer.innerHTML = `
      <div class="empty-state">
        <p>No courses added yet.</p>
      </div>
    `;
    return;
  }

  coursesContainer.innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="course-header">
        <div class="color-dot" data-color="${course.color || "#02c39a"}"></div>
        <p class="course-title">${course.name}</p>
      </div>

      <p class="course-code">${course.code || "No code provided"}</p>

      <div class="course-actions">
        <button class="edit-btn" data-id="${course._id}">Edit</button>
        <button class="delete-btn" data-id="${course._id}">Delete</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".color-dot").forEach(dot => {
    dot.style.setProperty("--course-color", dot.dataset.color);
  });
}

async function addOrUpdateCourse() {
  const name = courseNameInput.value.trim();
  const code = courseCodeInput.value.trim();
  const color = courseColorInput.value;

  if (!name) {
    alert("Please enter the course name.");
    return;
  }

  if (editingCourseId) {
    await updateCourseInDB(editingCourseId, {
      name,
      code,
      color
    });
  } else {
    await addCourseToDB({
      userId: currentUser._id,
      name,
      code,
      color
    });
  }

  clearForm();
  await loadCourses();
}

function editCourse(id) {
  const course = courses.find(course => course._id === id);
  if (!course) return;

  courseNameInput.value = course.name;
  courseCodeInput.value = course.code || "";
  courseColorInput.value = course.color || "#02c39a";
  editingCourseId = id;
  submitBtn.textContent = "Update Course";
}

async function deleteCourse(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this course and all associated deadlines and study sessions?"
  );

  if (!confirmed) return;

  await deleteCourseFromDB(id);

  if (editingCourseId === id) {
    clearForm();
  }

  await loadCourses();

  window.dispatchEvent(new Event("storage"));
}

coursesContainer.addEventListener("click", async function (event) {
  const editButton = event.target.closest(".edit-btn");
  const deleteButton = event.target.closest(".delete-btn");

  if (editButton) {
    editCourse(editButton.dataset.id);
    return;
  }

  if (deleteButton) {
    await deleteCourse(deleteButton.dataset.id);
    return;
  }
});

submitBtn.addEventListener("click", addOrUpdateCourse);

loadCourses();