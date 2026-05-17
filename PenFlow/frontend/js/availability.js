let availability = [];

const currentUser =
JSON.parse(
localStorage.getItem(
"currentUser"
)||"null"
);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dialogOverlay = document.getElementById('dialogOverlay');
const openDialogBtn = document.getElementById('openDialogBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const availabilityForm = document.getElementById('availabilityForm');
const availabilityList = document.getElementById('availabilityList');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');

async function loadAvailability() {
  if (!currentUser || !currentUser._id) {
    window.location.href = "login.html";
    return;
  }

  availability = await getAvailability(currentUser._id);
  renderAvailability();
}


openDialogBtn.addEventListener('click', () => {
  availabilityForm.reset();
  dialogOverlay.classList.add('open');
  document.getElementById('dayOfWeek').focus();
});

closeDialogBtn.addEventListener('click', () => {
  dialogOverlay.classList.remove('open');
});

dialogOverlay.addEventListener('click', (e) => {
  if (e.target === dialogOverlay) {
    dialogOverlay.classList.remove('open');
  }
});

function pad(value) {
  return String(value).padStart(2, '0');
}

function normalizeTimeInput(value) {
  const input = value.trim().toUpperCase().replace(/\s+/g, ' ');

  const amPmMatch = input.match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2] || '0');
    const meridiem = amPmMatch[3];

    if (hour < 1 || hour > 12 || minute > 59) return null;

    if (meridiem === 'AM') {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }

    return `${pad(hour)}:${pad(minute)}`;
  }

  const twentyFourMatch = input.match(/^(\d{1,2})(?::(\d{2}))$/);
  if (twentyFourMatch) {
    const hour = Number(twentyFourMatch[1]);
    const minute = Number(twentyFourMatch[2]);

    if (hour > 23 || minute > 59) return null;
    return `${pad(hour)}:${pad(minute)}`;
  }

  return null;
}

function formatTime(time) {
  const [hourStr, minute] = time.split(':');
  let hour = Number(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function getDurationHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
}

function formatDuration(durationHours) {
  if (Number.isInteger(durationHours)) {
    return `${durationHours} hour${durationHours !== 1 ? "s" : ""}`;
  }

  return `${durationHours.toFixed(1)} hours`;
}

function hasOverlap(dayOfWeek, startTime, endTime) {
  return availability.some(slot => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    return startTime < slot.endTime && endTime > slot.startTime;
  });
}

async function deleteSlot(id) {
  await deleteAvailabilityFromDB(id);
  await loadAvailability();
}

function renderAvailability() {
  if (availability.length === 0) {
    availabilityList.innerHTML = `
      <div class="empty-state">
        <p>No availability added yet. Create time slots for your study schedule.</p>
      </div>
    `;
    return;
  }

  const sorted = [...availability].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
        return a.startTime.localeCompare(b.startTime);
  });


  availabilityList.innerHTML = sorted.map(slot => {
    const duration = getDurationHours(slot.startTime, slot.endTime);

    return `

      <div class="availability-card">
        <div class="slot-header">
          <h3 class="slot-title">${DAYS[slot.dayOfWeek]}</h3>
        </div>

        <div class="slot-info">
          <p><strong>Time:</strong> ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</p>
          <p><strong>Duration:</strong> ${formatDuration(duration)}</p>
        </div>
        <div class="slot-actions">
          <button class="delete-btn" data-id="${slot._id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

availabilityList.addEventListener("click", async function (event) {
  const deleteButton = event.target.closest(".delete-btn");

  if (!deleteButton) return;

  await deleteSlot(deleteButton.dataset.id);
});


availabilityForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const dayOfWeek = Number(document.getElementById("dayOfWeek").value);
  const startTime = normalizeTimeInput(startTimeInput.value);
  const endTime = normalizeTimeInput(endTimeInput.value);

  if (!startTime || !endTime) {
    alert("Enter times like 9 AM, 2:30 PM, or 14:00.");
    return;
  }


   if (endTime <= startTime) {
    alert("End time must be later than start time.");
    return;
  }

    if (hasOverlap(dayOfWeek, startTime, endTime)) {
    alert("This time slot overlaps with an existing slot on the same day.");
    return;
  }

  await addAvailabilityToDB({
    userId: currentUser._id,
    dayOfWeek,
    startTime,
    endTime
  });


  availabilityForm.reset();
  dialogOverlay.classList.remove("open");

  await loadAvailability();
});

loadAvailability();