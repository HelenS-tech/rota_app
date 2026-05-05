let currentYear = 2026;
let currentMonth = 5; // June = 5

function generateShifts(year, month) {
  const shifts = [];
  let id = 1;
  const extraMonday = 1;

  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day);

    if (date.getMonth() !== month) break;

    const dayName = date.toLocaleDateString("en-GB", { weekday: "short" });
    const label = `${dayName} ${day}`;

    if (["Wed", "Thu", "Fri", "Sat"].includes(dayName) || day === extraMonday) {
      shifts.push({
        id: id++,
        week: Math.ceil(day / 7),
        date: label,
        role: "Bar",
        claimedBy: null
      });
    }

    if (["Thu", "Fri"].includes(dayName) || day === extraMonday) {
      shifts.push({
        id: id++,
        week: Math.ceil(day / 7),
        date: label,
        role: "Pizza",
        claimedBy: null
      });
    }
  }

  return shifts;
}

let shifts = generateShifts(currentYear, currentMonth);
let selectedStaff = "";

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

        shiftSlot.innerHTML = `
          <p>${shift.role}</p>
          <p>${shift.claimedBy ? "Claimed by: " + shift.claimedBy : "Available"}</p>
          ${
            shift.claimedBy === selectedStaff
              ? `<button onclick="cancelShift(${shift.id})">Cancel Shift</button>`
              : !shift.claimedBy
                ? `<button onclick="claimShift(${shift.id})">Claim Shift</button>`
                : `<p>Claimed</p>`
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

  if (!shift.claimedBy) {
    shift.claimedBy = selectedStaff;
  }

  renderShifts();
}

function cancelShift(id) {
  const shift = shifts.find(s => s.id === id);

  if (shift.claimedBy === selectedStaff) {
    shift.claimedBy = null;
  }

  renderShifts();
}

staffNames.forEach(name => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  staffSelect.appendChild(option);
});

staffSelect.addEventListener("change", function () {
  const chosenName = staffSelect.value;

  if (!chosenName) return;

  const enteredPin = prompt("Enter PIN for " + chosenName);

  if (enteredPin === staffPins[chosenName]) {
    selectedStaff = chosenName;
    renderShifts();
  } else {
    alert("Incorrect PIN");
    staffSelect.value = "";
    selectedStaff = "";
    renderShifts();
  }
});

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

renderShifts();