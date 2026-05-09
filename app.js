let currentYear = 2026;
let currentMonth = 5; // June = 5

function generateShifts(year, month) {
  const shifts = [];
  let id = 1;
  let extraMonday = null;

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
    function getOrdinal(n) {
  if (n > 3 && n < 21) return n + "th";
  switch (n % 10) {
    case 1: return n + "st";
    case 2: return n + "nd";
    case 3: return n + "rd";
    default: return n + "th";
  }
}

const fullDay = date.toLocaleDateString("en-GB", { weekday: "long" });
const label = `${fullDay} ${getOrdinal(day)}`;

    if (["Wed", "Thu", "Fri", "Sat"].includes(dayName) || day === extraMonday) {
      shifts.push({
        id: id++,
        week: Math.ceil(day / 7),
        date: label,
        event: dayName === "Wed" ? "Quiz Night" : "",
        role: "Bar",
        time: "18:00 - 22:00",
        capacity: 2,
        claimedBy: []
      });
    }

    if (["Thu", "Fri", "Sat"].includes(dayName) || day === extraMonday) {
      shifts.push({
        id: id++,
        week: Math.ceil(day / 7),
        date: label,
        event: dayName === "Wed" ? "Quiz Night" : "",
        role: "Pizza",
        time: "17:00 - 21:00",
        capacity: 1,
        claimedBy: []
      });
    }
  }

  return shifts;
}

let shifts = generateShifts(currentYear, currentMonth);
let selectedStaff = localStorage.getItem("staff") || "";

const staffNames = [
  "Helen",
  "Elaine",
  "Richard",
  "Roxy",
  "Rachael",
  "Jes",
  "Harvey",
  "Sharon"
];

const staffPins = {
  Helen: "1234",
  Elaine: "5566",
  Richard: "2345",
  Roxy: "3456",
  Rachael: "4567",
  Jes: "6587",
  Harvey: "9988",
  Sharon: "2233"
};

const shiftsDiv = document.getElementById("shifts");
const staffSelect = document.getElementById("staffSelect");

function renderShifts() {
  shiftsDiv.innerHTML = "";

  const monthTitle = document.createElement("h2");
  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-GB", {
    month: "long"
  });

  monthTitle.textContent = `${monthName} ${currentYear} Rota`;
  shiftsDiv.appendChild(monthTitle);

  const controls = document.createElement("div");
  controls.className = "month-controls";

  controls.innerHTML = `
    <button id="prevMonth">Previous Month</button>
    <button id="nextMonth">Next Month</button>
  `;

  shiftsDiv.appendChild(controls);

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;

    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    shifts = generateShifts(currentYear, currentMonth);
    renderShifts();
  });

  document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    shifts = generateShifts(currentYear, currentMonth);
    renderShifts();
  });

  const groupedByWeek = {};

  shifts.forEach(shift => {
    if (!groupedByWeek[shift.week]) {
      groupedByWeek[shift.week] = [];
    }

    groupedByWeek[shift.week].push(shift);
  });

  Object.keys(groupedByWeek).forEach(week => {
    const weekDiv = document.createElement("div");
    weekDiv.className = "week-row";
    weekDiv.innerHTML = `<h3>Week ${week}</h3>`;

    const groupedByDate = {};

    groupedByWeek[week].forEach(shift => {
      if (!groupedByDate[shift.date]) {
        groupedByDate[shift.date] = [];
      }

      groupedByDate[shift.date].push(shift);
    });

    Object.keys(groupedByDate).forEach(date => {
      const dayCard = document.createElement("div");
      dayCard.className = "day-card";
      dayCard.innerHTML = `<h4>${date}</h4>`;

      groupedByDate[date].forEach(shift => {
        const shiftSlot = document.createElement("div");
        shiftSlot.className = "shift-slot";

        if (shift.claimedBy.includes(selectedStaff)) {
          shiftSlot.classList.add("my-shift");
        }

        shiftSlot.innerHTML = `
          <p><strong>${shift.role}</strong></p>
          <p>${shift.time}</p>
          ${shift.event ? `<p><em>${shift.event}</em></p>` : ""}
          <p>${shift.claimedBy.length}/${shift.capacity} filled</p>
          <p>
            ${
              shift.claimedBy.length > 0
                ? "Claimed by: " + shift.claimedBy.join(", ")
                : "Available"
            }
          </p>
          ${
            shift.claimedBy.includes(selectedStaff)
              ? `<button onclick="cancelShift(${shift.id})">Cancel Shift</button>`
              : shift.claimedBy.length < shift.capacity
                ? `<button onclick="claimShift(${shift.id})">Claim Shift</button>`
                : `<p>Full</p>`
          }
        `;

        dayCard.appendChild(shiftSlot);
      });

      weekDiv.appendChild(dayCard);
    });

    shiftsDiv.appendChild(weekDiv);
  });
}

function claimShift(id) {
  if (!selectedStaff) {
    alert("Please choose your name first.");
    return;
  }

  const shift = shifts.find(s => s.id === id);

  if (
    !shift.claimedBy.includes(selectedStaff) &&
    shift.claimedBy.length < shift.capacity
  ) {
    shift.claimedBy.push(selectedStaff);
    alert("Shift claimed!");
  }

  renderShifts();
}

function cancelShift(id) {
  if (!confirm("Cancel this shift?")) return;

  const shift = shifts.find(s => s.id === id);

  shift.claimedBy = shift.claimedBy.filter(name => name !== selectedStaff);

  alert("Shift cancelled!");
  renderShifts();
}

staffNames.forEach(name => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  staffSelect.appendChild(option);
});

staffSelect.value = selectedStaff;

staffSelect.addEventListener("change", function () {
  const chosenName = staffSelect.value;

  if (!chosenName) return;

  const enteredPin = prompt("Enter PIN for " + chosenName);

  if (enteredPin === staffPins[chosenName]) {
    selectedStaff = chosenName;
    localStorage.setItem("staff", selectedStaff);
    renderShifts();
  } else {
    alert("Incorrect PIN");
    staffSelect.value = selectedStaff;
    renderShifts();
  }
});

renderShifts();