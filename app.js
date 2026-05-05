const shifts = [
  {  id: 1, week: 1, date: "Wed 1", role: "Bar", claimedBy: null },
  { id: 2, week: 1, date: "Thu 2", role: "Bar", claimedBy: null },
  { id: 3, week: 1, date: "Thu 2", role: "Pizza", claimedBy: null },
  { id: 4, week: 1, date: "Fri 3", role: "Bar", claimedBy: null },
  { id: 5, week: 1, date: "Fri 3", role: "Pizza", claimedBy: null },
  { id: 6, week: 1, date: "Sat 4", role: "Bar", claimedBy: null },
  { id: 7, week: 1, date: "Sat 4", role: "Pizza", claimedBy: null },
  {  id: 8, week: 2, date: "Wed 8", role: "Bar", claimedBy: null },
  { id: 9, week: 2, date: "Thu 9", role: "Bar", claimedBy: null },
  { id: 10, week: 2, date: "Thu 9", role: "Pizza", claimedBy: null },
  { id: 11, week: 2, date: "Fri 10", role: "Bar", claimedBy: null },
  { id: 12, week: 2, date: "Fri 10", role: "Pizza", claimedBy: null },
  { id: 13, week: 2, date: "Sat 11", role: "Bar", claimedBy: null },
  { id: 14, week: 2, date: "Sat 11", role: "Pizza", claimedBy: null },
  {  id: 15, week: 3, date: "Wed 15", role: "Bar", claimedBy: null },
  { id: 16, week: 3, date: "Thu 16", role: "Bar", claimedBy: null },
  { id: 17, week: 3, date: "Thu 16", role: "Pizza", claimedBy: null },
  { id: 18, week: 3, date: "Fri 17", role: "Bar", claimedBy: null },
  { id: 19, week: 3, date: "Fri 17", role: "Pizza", claimedBy: null },
  { id: 20, week: 3, date: "Sat 18", role: "Bar", claimedBy: null },
  { id: 21, week: 3, date: "Sat 18", role: "Pizza", claimedBy: null },
  {  id: 22, week: 4, date: "Wed 22", role: "Bar", claimedBy: null },
  { id: 23, week: 4, date: "Thu 23", role: "Bar", claimedBy: null },
  { id: 24, week:4, date: "Thu 23", role: "Pizza", claimedBy: null },
  { id: 25, week: 4, date: "Fri 24", role: "Bar", claimedBy: null },
  { id: 26, week: 4, date: "Fri 24", role: "Pizza", claimedBy: null },
  { id: 27, week: 4, date: "Sat 25", role: "Bar", claimedBy: null },
  { id: 28, week: 4, date: "Sat 25", role: "Pizza", claimedBy: null }
];

const shiftsDiv = document.getElementById("shifts");

function renderShifts() {
  shiftsDiv.innerHTML = "";

  const monthTitle = document.createElement("h2");
  monthTitle.textContent = "Monthly Rota";
  shiftsDiv.appendChild(monthTitle);

  const groupedByWeek = {};

  // Group by week first
  shifts.forEach(shift => {
    if (!groupedByWeek[shift.week]) {
      groupedByWeek[shift.week] = [];
    }
    groupedByWeek[shift.week].push(shift);
  });

  // Loop through weeks
  Object.keys(groupedByWeek).forEach(week => {
    const weekDiv = document.createElement("div");
    weekDiv.className = "week-row";

    weekDiv.innerHTML = `<h3>Week ${week}</h3>`;

    const groupedByDate = {};

    // Group inside each week by date
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

        shiftSlot.innerHTML = `
          <p>${shift.role}</p>
          <p>${shift.claimedBy ? "Claimed by: " + shift.claimedBy : "Available"}</p>
          ${
            shift.claimedBy === "You"
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
  const shift = shifts.find(s => s.id === id);

  if (!shift.claimedBy) {
    shift.claimedBy = "You";
  }

  renderShifts();
}

function cancelShift(id) {
  const shift = shifts.find(s => s.id === id);

  if (shift.claimedBy) {
    shift.claimedBy = null;
  }

  renderShifts();
}

renderShifts();
