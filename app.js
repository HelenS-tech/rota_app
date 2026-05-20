const supabaseUrl = "https://xaznroqehxysmydudwie.supabase.co";
const supabaseKey = "sb_publishable_M4WS5WMH-sjVvxqDzW777A_vqtkjfJT";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected");

let currentYear = 2026;
let currentMonth = 5; // June = 5
let selectedWeek = 1;
let shifts = [];
let claimSchedule = [];

let selectedStaff = localStorage.getItem("staff") || "";

const staffNames = [
  "Chris",
  "Dan",
  "Elaine",
  "Harvey",
  "Helen",
  "James",
  "Jez",
  "Nathan",
  "Rachael A",
  "Rebecca",
  "Richard H",
  "Roxy O",
  "Sharon",
];

const staffPins = {
  Chris: "1122",
  Dan: "6789",
  Elaine: "5566",
  Harvey: "5678",
  Helen: "1234",
  James: "8899",
  Jez: "6587",
  Nathan: "7788",
  "Rachael A": "4567",
  Rebecca: "9988",
  "Richard H": "3344",
  "Roxy O": "3456",
  Sharon: "2233",
};

const claimAccess = ["Jez", "Richard H", "Roxy O"];

const pizzaStaff = ["Helen", "Elaine", "Roxy O"];

const shiftsDiv = document.getElementById("shifts");
const staffSelect = document.getElementById("staffSelect");

function getOrdinal(n) {
  if (n > 3 && n < 21) return n + "th";

  switch (n % 10) {
    case 1:
      return n + "st";
    case 2:
      return n + "nd";
    case 3:
      return n + "rd";
    default:
      return n + "th";
  }
}

function generateShifts(year, month) {
  const newShifts = [];
  let id = Date.now();

  let extraMonday = null;

  function getWednesdayEvent(date) {
    const day = date.getDate();
    const weekOfMonth = Math.ceil(day / 7);

    if (weekOfMonth === 1) return "Quiz Night";
    if (weekOfMonth === 2) return "Open Mic";
    if (weekOfMonth === 3) return "Classic Car";

    const nextWeek = new Date(date);
    nextWeek.setDate(day + 7);

    if (nextWeek.getMonth() !== date.getMonth()) return "Bingo";

    return "";
  }

  for (let day = 1; day <= 7; day++) {
    const date = new Date(year, month, day);
    const dayName = date.toLocaleDateString("en-GB", { weekday: "short" });

    if (dayName === "Mon") {
      extraMonday = day;
      break;
    }
  }

  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break;

    const dayName = date.toLocaleDateString("en-GB", { weekday: "short" });
    const fullDay = date.toLocaleDateString("en-GB", { weekday: "long" });
    const label = `${fullDay} ${getOrdinal(day)}`;
    const week = Math.ceil(day / 7);

    function addShift(role, time, capacity, event = "") {
      newShifts.push({
        id: id++,
        year,
        month,
        week,
        date: label,
        event,
        role,
        time,
        capacity,
        claimedBy: [],
      });
    }

    if (day === extraMonday) {
      addShift("Bar", "17:00 - 22:00", 2, "Biker Night");
      addShift("Pizza", "18:00 - 20:00", 1, "Biker Night");
      continue;
    }

    if (dayName === "Wed") {
      addShift("Bar", "18:00 - 22:00", 2, getWednesdayEvent(date));
    }

    if (["Thu", "Fri"].includes(dayName)) {
      addShift("Bar", "16:00 - 18:00", 2);
      addShift("Bar", "18:00 - 22:00", 2);
    }

    if (dayName === "Sat") {
      addShift("Bar", "14:00 - 18:00", 2);
      addShift("Bar", "18:00 - 22:00", 2);
    }

    if (["Wed","Thu", "Fri", "Sat"].includes(dayName)) {
      addShift("Pizza", "17:00 - 22:00", 1);
    }
  }

  return newShifts;
}

async function loadShiftsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("shifts")
    .select("*")
    .eq("year", currentYear)
    .eq("month", currentMonth)
    .order("id");

  if (error) {
    console.error("Error loading shifts:", error);
    alert("There was a problem loading the rota.");
    return;
  }

  if (data.length === 0) {
    const newMonthShifts = generateShifts(currentYear, currentMonth);

    const { data: insertedData, error: insertError } = await supabaseClient
      .from("shifts")
      .insert(newMonthShifts)
      .select();

    if (insertError) {
      console.error("Error creating month:", insertError);
      alert("There was a problem creating this month.");
      return;
    }

    shifts = insertedData;
  } else {
    shifts = data;
  }

  renderShifts();
}

async function loadClaimSchedule() {
  const { data, error } = await supabaseClient
    .from("claim_schedule")
    .select("*");

  if (error) {
    console.error("Error loading claim schedule:", error);
    return;
  }

  claimSchedule = data;
}

async function saveShiftToSupabase(shift) {
  const { error } = await supabaseClient
    .from("shifts")
    .update({
  claimedBy: shift.claimedBy,
  recentlyCancelled: shift.recentlyCancelled,
  cancelledBy: shift.cancelledBy,
  cancelledAt: shift.cancelledAt
})
    .eq("id", shift.id);

  if (error) {
    console.error("Error saving shift:", error);
    alert("There was a problem saving this shift.");
  }
}

function canClaimBarShift() {
  const order = ["Jez", "Richard H", "Roxy O"];

  const allRow = claimSchedule.find(
    (row) => row.staff_name.trim().toLowerCase() === "all",
  );

  if (allRow && allRow.completed === true) {
    return true;
  }

  const selectedIndex = order.indexOf(selectedStaff);

  if (selectedIndex === -1) {
    return false;
  }

  if (selectedIndex === 0) {
    return true;
  }

  const previousPerson = order[selectedIndex - 1];

  const previousRow = claimSchedule.find(
    (row) =>
      row.staff_name.trim().toLowerCase() === previousPerson.toLowerCase(),
  );

  return previousRow && previousRow.completed === true;
}

function updateClaimStatus() {
  const statusDiv = document.getElementById("claimStatus");

  if (!statusDiv) return;

  const order = ["Jez", "Richard H", "Roxy O"];

  const allRow = claimSchedule.find(
    (row) => row.staff_name.trim().toLowerCase() === "all",
  );

  if (allRow && allRow.completed === true) {
    statusDiv.innerHTML = `
      <p>Bar: Open to all staff</p>
      <p>Food: Open to kitchen staff</p>
    `;
    return;
  }

  let currentPerson = order[0];

  for (let i = 0; i < order.length; i++) {
    const row = claimSchedule.find(
      (scheduleRow) =>
        scheduleRow.staff_name.trim().toLowerCase() === order[i].toLowerCase(),
    );

    if (!row || row.completed !== true) {
      currentPerson = order[i];
      break;
    }

    if (i === order.length - 1) {
      currentPerson = "All";
    }
  }

  if (currentPerson === "All") {
    statusDiv.innerHTML = `
      <p>Bar: Open to all staff</p>
      <p>Food: Open to kitchen staff</p>
    `;
  } else {
    statusDiv.innerHTML = `
      <p>Bar shifts: Priority access for ${currentPerson}</p>
      <p>Food: Open to kitchen staff</p>
    `;
  }
}

function renderShifts() {
  shiftsDiv.innerHTML = "";

  const monthTitle = document.createElement("h2");
  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-GB",
    {
      month: "long",
    },
  );

  monthTitle.textContent = `${monthName} ${currentYear}`;
  shiftsDiv.appendChild(monthTitle);

  const controls = document.createElement("div");
  controls.className = "month-controls";
  controls.innerHTML = `
    <button id="prevMonth">Previous Month</button>
    <button id="nextMonth">Next Month</button>
    <button id="overviewBtn">Month Overview</button>
  `;

  shiftsDiv.appendChild(controls);

  document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    selectedWeek = 1;
    loadShiftsFromSupabase();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;

    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    selectedWeek = 1;
    loadShiftsFromSupabase();
  });

  document
    .getElementById("overviewBtn")
    .addEventListener("click", showMonthOverview);

  const groupedByWeek = {};

  shifts.forEach((shift) => {
    if (!groupedByWeek[shift.week]) {
      groupedByWeek[shift.week] = [];
    }

    groupedByWeek[shift.week].push(shift);
  });

  const weekTabs = document.createElement("div");
  weekTabs.className = "week-tabs";

  weekTabs.innerHTML = Object.keys(groupedByWeek)
    .map(
      (week) => `
      <button class="${Number(week) === selectedWeek ? "active-week" : ""}" onclick="selectWeek(${week})">
        Week ${week}
      </button>
    `,
    )
    .join("");

  shiftsDiv.appendChild(weekTabs);

  Object.keys(groupedByWeek)
    .filter((week) => Number(week) === selectedWeek)
    .forEach((week) => {
      const weekDiv = document.createElement("div");
      weekDiv.className = "week-row";
      weekDiv.innerHTML = `<h3>Week ${week}</h3>`;

      const groupedByDate = {};

      groupedByWeek[week].forEach((shift) => {
        if (!groupedByDate[shift.date]) {
          groupedByDate[shift.date] = [];
        }

        groupedByDate[shift.date].push(shift);
      });

      Object.keys(groupedByDate).forEach((date) => {
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";

        const dayEvent = groupedByDate[date].find((s) => s.event)?.event;

        dayCard.innerHTML = `
          <h4>${date}</h4>
          ${dayEvent ? `<p class="day-event">${dayEvent}</p>` : ""}
        `;

        groupedByDate[date]
          .sort((a, b) => {
            if (a.role === b.role) {
              return a.time.localeCompare(b.time);
            }

            if (a.role === "Bar") return -1;
            if (b.role === "Bar") return 1;

            return 0;
          })
          .forEach((shift) => {
          const shiftSlot = document.createElement("div");
          shiftSlot.className = `shift-slot ${shift.role.toLowerCase()}`;

          if (shift.claimedBy.includes(selectedStaff)) {
            shiftSlot.classList.add("my-shift");
          }

          if (shift.claimedBy.length > 0) {
            shiftSlot.classList.add("claimed-shift");
          }

          if (shift.claimedBy.length >= shift.capacity) {
            shiftSlot.classList.add("full");
          }

          shiftSlot.innerHTML = `
            <div class="shift-header ${shift.role.toLowerCase()}">
              <strong>${shift.role}</strong>
              <span>${shift.time}</span>
            </div>

            <p>${shift.claimedBy.length}/${shift.capacity} filled</p>
            ${shift.recentlyCancelled ? `<p class="cancel-alert">Recently available</p>` : ""}

            <div class="shift-progress">
              <div 
                class="shift-progress-fill ${shift.role.toLowerCase()}" 
                style="width: ${(shift.claimedBy.length / shift.capacity) * 100}%">
              </div>
            </div>

            ${
              shift.claimedBy.includes(selectedStaff)
                ? `<p class="you-are-working">You are working this shift</p>`
                : ""
            }

            <p class="${
              shift.claimedBy.length === 0
                ? "available"
                : shift.claimedBy.length < shift.capacity
                  ? "partial-fill"
                  : "full-fill"
            }">
              ${
                shift.claimedBy.length === 0
                  ? "Available"
                  : shift.claimedBy.length < shift.capacity
                    ? `${shift.claimedBy.length} of ${shift.capacity} taken (${shift.claimedBy.join(", ")})`
                    : `Full (${shift.claimedBy.join(", ")})`
              }
            </p>

            ${
              shift.claimedBy.includes(selectedStaff)
                ? `<button onclick="cancelShift(${shift.id})">Cancel Shift</button>`
                : shift.claimedBy.length < shift.capacity
                  ? `<button onclick="claimShift(${shift.id})">Claim Shift</button>`
                  : `<p class="full-fill">Full</p>`
            }
          `;

          dayCard.appendChild(shiftSlot);
        });

        weekDiv.appendChild(dayCard);
      });

      shiftsDiv.appendChild(weekDiv);
      });
          
      }

      function selectWeek(week) {
        selectedWeek = week;
        renderShifts();
      }

function showMonthOverview() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "month-modal calendar-modal";

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-GB",
    {
      month: "long",
    },
  );

  modal.innerHTML = `
    <button class="close-modal">Close</button>
    <h2>${monthName} ${currentYear}</h2>

    <div class="calendar-legend">
      <span class="legend-bar"></span> Bar
      <span class="legend-pizza"></span> Pizza
      <span class="legend-full"></span> Full
    </div>

    <div class="calendar-weekdays">
      <span>Mon</span>
      <span>Tue</span>
      <span>Wed</span>
      <span>Thu</span>
      <span>Fri</span>
      <span>Sat</span>
      <span>Sun</span>
    </div>

    <div class="calendar-grid"></div>
  `;

  const calendarGrid = modal.querySelector(".calendar-grid");

  const firstDay = new Date(currentYear, currentMonth, 1);
  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= 31; day++) {
    const date = new Date(currentYear, currentMonth, day);

    if (date.getMonth() !== currentMonth) break;

    const fullDay = date.toLocaleDateString("en-GB", { weekday: "long" });
    const dateLabel = `${fullDay} ${getOrdinal(day)}`;
    const dayShifts = shifts.filter((shift) => shift.date === dateLabel);

    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.innerHTML = `<strong>${day}</strong>`;

    dayShifts
      .sort((a, b) => {
        if (a.role === b.role) {
          return a.time.localeCompare(b.time);
        }

        if (a.role === "Bar") return -1;
        if (b.role === "Bar") return 1;

        return 0;
      })
      .forEach(shift => {
      const isFull = shift.claimedBy.length >= shift.capacity;

      const line = document.createElement("div");
      const fillPercent =
        shift.claimedBy.length === 0
          ? 100
          : (shift.claimedBy.length / shift.capacity) * 100;

      line.className = `calendar-line ${shift.role.toLowerCase()} ${isFull ? "full" : ""}`;
      line.style.width = `${fillPercent}%`;
      line.title = `${shift.role} ${shift.time} ${shift.claimedBy.length}/${shift.capacity}`;
      if (shift.claimedBy.length === 1) {
      line.textContent = shift.claimedBy[0].split(" ")[0];
        } else {
          line.textContent = shift.claimedBy
            .map(name => {
              const parts = name.split(" ");
              return parts.map(part => part.charAt(0).toUpperCase()).join("");
            })
            .join(", ");
        }

      cell.appendChild(line);
    });

    calendarGrid.appendChild(cell);
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector(".close-modal").addEventListener("click", () => {
    overlay.remove();
  });
};

async function markFinishedChoosing() {
  if (!selectedStaff) {
    alert("Please choose your name first.");
    return;
  }

  const { error } = await supabaseClient
    .from("claim_schedule")
    .update({ completed: true })
    .eq("staff_name", selectedStaff);

  if (error) {
    console.error("Error marking finished:", error);
    alert("There was a problem saving this.");
    return;
  }

  alert("Thanks — the next person can now choose.");

  if (selectedStaff === "Roxy O") {
    const { error: allError } = await supabaseClient
      .from("claim_schedule")
      .update({ completed: true })
      .eq("staff_name", "All");

    if (allError) {
      console.error("Error opening to everyone:", allError);
      alert(
        "Roxy was marked finished, but there was a problem opening to everyone.",
      );
      return;
    }
  }

  await loadClaimSchedule();
  updateClaimStatus();
  renderShifts();
};

function updateFinishedButton() {
  const finishedBtn = document.getElementById("finishedBtn");
  if (!finishedBtn) return;

  const order = ["Jez", "Richard H", "Roxy O"];

  const allRow = claimSchedule.find(
    (row) => row.staff_name.trim().toLowerCase() === "all",
  );

  if (allRow && allRow.completed === true) {
    finishedBtn.style.display = "none";
    return;
  }

  if (order.includes(selectedStaff)) {
    finishedBtn.style.display = "block";
  } else {
    finishedBtn.style.display = "none";
  }
};

async function claimShift(id) {
  if (!selectedStaff) {
    alert("Please choose your name first.");
    return;
  }

  const shift = shifts.find((s) => s.id === id);

  const pizzaStaff = ["Helen", "Elaine", "Roxy O"];

  if (shift.role === "Pizza") {
    if (!pizzaStaff.includes(selectedStaff)) {
      alert("Only pizza staff can claim pizza shifts.");
      return;
    }
  }

  if (shift.role === "Bar") {
    if (!canClaimBarShift()) {
      alert("You can view the rota, but Bar claiming is not open for you yet.");
      return;
    }
  }

  /*if (!claimAccess.includes(selectedStaff)) {
    alert("You can view the rota, but claiming is not open for you yet.");
    return;
  }*/

  const alreadyWorkingDifferentRoleThisDay = shifts.some((otherShift) => {
    return (
      otherShift.date === shift.date &&
      otherShift.id !== shift.id &&
      otherShift.role !== shift.role &&
      otherShift.claimedBy.includes(selectedStaff)
    );
  });

  if (alreadyWorkingDifferentRoleThisDay) {
    alert("You cannot claim both Bar and Pizza on the same day.");
    return;
  }

  if (
    !shift.claimedBy.includes(selectedStaff) &&
    shift.claimedBy.length < shift.capacity
  ) {
    const confirmed = confirm("This shift is yours if you want it?");

if (!confirmed) {
  return;
}

shift.claimedBy.push(selectedStaff);
await saveShiftToSupabase(shift);

alert("This Shift is yours!");
  }

  renderShifts();
};

async function cancelShift(id) {
  if (!confirm("Cancel this shift?")) return;

  const shift = shifts.find((s) => s.id === id);

  shift.claimedBy = shift.claimedBy.filter((name) => name !== selectedStaff);

  shift.recentlyCancelled = true;
  shift.cancelledBy = selectedStaff;
  shift.cancelledAt = new Date().toISOString();

  await saveShiftToSupabase(shift);

  alert("You have cancelled your shift!");
  renderShifts();
};

function getInitials(names) {
  if (!names || names.length === 0) return "";

  return names
    .map(name => name.charAt(0).toUpperCase())
    .join("");
};

document.getElementById("logoutBtn").addEventListener("click", () => {
  const order = ["Jez", "Richard H", "Roxy O"];

  const currentRow = claimSchedule.find(
    (row) =>
      row.staff_name.trim().toLowerCase() === selectedStaff.toLowerCase(),
  );

  if (
    order.includes(selectedStaff) &&
    currentRow &&
    currentRow.completed !== true
  ) {
    alert('Please press "I’ve finished choosing" before logging out.');
    return;
  }

  localStorage.removeItem("staff");
  selectedStaff = "";
  alert("You have logged out.");
  location.reload();
});

staffNames.forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  staffSelect.appendChild(option);
});

staffSelect.value = selectedStaff,

staffSelect.addEventListener("change", function () {
  const chosenName = staffSelect.value;

  if (!chosenName) return;

  const enteredPin = prompt("Enter PIN for " + chosenName);

  if (enteredPin === staffPins[chosenName]) {
    selectedStaff = chosenName;
    localStorage.setItem("staff", selectedStaff);
    renderShifts();
    updateFinishedButton();
  } else {
    alert("Incorrect PIN");
    staffSelect.value = selectedStaff;
    renderShifts();
    updateFinishedButton();
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  const order = ["Jez", "Richard H", "Roxy O"];

  const currentRow = claimSchedule.find(
    (row) =>
      row.staff_name.trim().toLowerCase() === selectedStaff.toLowerCase(),
  );

  if (
    order.includes(selectedStaff) &&
    currentRow &&
    currentRow.completed !== true
  ) {
    alert('Please press "I’ve finished choosing" before logging out.');
    return;
  }

  localStorage.removeItem("staff");
  selectedStaff = "";
  alert("You have logged out.");
  location.reload();
});

document
  .getElementById("finishedBtn")
  .addEventListener("click", markFinishedChoosing);

async function startApp() {
  await loadClaimSchedule();
  updateClaimStatus();
  updateFinishedButton();
  await loadShiftsFromSupabase();
}

startApp();