const shifts = [
  { id: 1, date: "Wed", role: "Bar", claimedBy: null },
  { id: 2, date: "Thur", role: "Bar", claimedBy: null },
  { id: 3, date: "Fri", role: "Bar", claimedBy: null },
  { id: 4, date: "Sat", role: "Bar", claimedBy: null },
  { id: 5, date: "Thur", role: "Pizza", claimedBy: null },
  { id: 6, date: "Fri", role: "Pizza", claimedBy: null },
  { id: 7, date: "Sat", role: "Pizza", claimedBy: null }
];

const shiftsDiv = document.getElementById("shifts");

function renderShifts() {
  shiftsDiv.innerHTML = "";

  shifts.forEach(shift => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p>${shift.date} - ${shift.role}</p>
      <p>${shift.claimedBy ? "Claimed by: " + shift.claimedBy : "Available"}</p>
      <button onclick="claimShift(${shift.id})" ${shift.claimedBy ? "disabled" : ""}>
        ${shift.claimedBy ? "Taken" : "Claim Shift"}
      </button>
    `;

    shiftsDiv.appendChild(div);
  });
}

function claimShift(id) {
  const shift = shifts.find(s => s.id === id);

  if (!shift.claimedBy) {
    shift.claimedBy = "You";
  }

  renderShifts();
}

renderShifts();