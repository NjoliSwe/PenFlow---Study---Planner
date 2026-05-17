const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");
const toggleButtons = document.querySelectorAll(".toggle-password");

function getCurrentFileName() {
  return window.location.pathname.split("/").pop();
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch (error) {
    return null;
  }
}

function applyUserGreeting() {
  const user = getCurrentUser();
  const userName = document.getElementById("userName");
  const greeting = document.querySelector(".greeting");
  const displayName = user && user.fullName ? user.fullName : "Student";

  if (userName) {
    userName.textContent = displayName;
  } else if (greeting) {
    greeting.textContent = `Hello, ${displayName} 👋`;
  }
}

function requireAuthForProtectedPages() {
  const protectedPages = [
    "HomePage.html",
    "courses.html",
    "deadlines.html",
    "studyplan.html",
    "availability.html",
    "reminders.html",
    "progress.html",
    "statistics.html"
  ];

  const currentFile = getCurrentFileName();
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUser = getCurrentUser();

  if (
    protectedPages.includes(currentFile) &&
    (isLoggedIn !== "true" || !currentUser || !currentUser._id)
  ) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    try {
      const result = await loginUser({
        email,
        password
      });

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(result.user));

      window.location.href = "HomePage.html";
    } catch (error) {
      alert(error.message || "Invalid email or password");
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      alert("Invalid email format");
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).{8,}$/;

    if (!passwordPattern.test(password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const result = await signupUser({
        fullName,
        email,
        password
      });

      alert(result.message || "Account created successfully");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message || "Signup failed. Please try again.");
    }
  });
}

toggleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      button.classList.add("hide");
    } else {
      input.type = "password";
      button.classList.remove("hide");
    }
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}

requireAuthForProtectedPages();
applyUserGreeting();