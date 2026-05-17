
// Connects frontend files with backend routes

const API_URL = "https://penflow-study-planner.onrender.com";


async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_URL}${url}`, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error(error.message || "Load failed");
  }
}



async function signupUser(userData) {
  return request("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
}

async function loginUser(loginData) {
  return request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
  });
}



async function getCourses(userId) {
  return request(`/courses/${userId}`);
}

async function addCourseToDB(courseData) {
  return request("/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(courseData)
  });
}

async function updateCourseInDB(id, courseData) {
  return request(`/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(courseData)
  });
}

async function deleteCourseFromDB(id) {
  return request(`/courses/${id}`, {
    method: "DELETE"
  });
}



async function getDeadlines(userId) {
  return request(`/deadlines/${userId}`);
}

async function addDeadlineToDB(deadlineData) {
  return request("/deadlines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(deadlineData)
  });
}

async function updateDeadlineInDB(id, deadlineData) {
  return request(`/deadlines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(deadlineData)
  });
}

async function deleteDeadlineFromDB(id) {
  return request(`/deadlines/${id}`, {
    method: "DELETE"
  });
}



async function getAvailability(userId) {
  return request(`/availability/${userId}`);
}

async function addAvailabilityToDB(slotData) {
  return request("/availability", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(slotData)
  });
}

async function deleteAvailabilityFromDB(id) {
  return request(`/availability/${id}`, {
    method: "DELETE"
  });
}



async function getStudySessions(userId) {
  return request(`/sessions/${userId}`);
}

async function addStudySessionToDB(sessionData) {
  return request("/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(sessionData)
  });
}

async function addManyStudySessionsToDB(sessions) {
  return request("/sessions/many", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessions })
  });
}

async function updateStudySessionInDB(id, sessionData) {
  return request(`/sessions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(sessionData)
  });
}

async function deleteStudySessionFromDB(id) {
  return request(`/sessions/${id}`, {
    method: "DELETE"
  });
}



async function getReminderSettings(userId) {
  return request(`/reminders/${userId}`);
}

async function saveReminderSettingsToDB(settingsData) {
  return request("/reminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(settingsData)
  });
}