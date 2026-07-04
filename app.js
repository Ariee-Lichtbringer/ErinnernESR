const storageKey = "erinnern-esr-signups";

const form = document.querySelector("#signupForm");
const list = document.querySelector("#signupList");
const exportButton = document.querySelector("#exportCsv");

function readSignups() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function writeSignups(signups) {
  localStorage.setItem(storageKey, JSON.stringify(signups));
}

function renderSignups() {
  const signups = readSignups();

  if (!signups.length) {
    list.innerHTML = "<p class=\"empty\">Noch keine Vormerkungen gespeichert.</p>";
    return;
  }

  list.innerHTML = signups.map((entry, index) => `
    <article class="signup-entry">
      <strong>${escapeHtml(entry.student)}</strong>
      <small>${escapeHtml(entry.className)} | ${escapeHtml(entry.trip)}</small>
      <p>${escapeHtml(entry.guardian)}<br>${escapeHtml(entry.email)} ${entry.phone ? "| " + escapeHtml(entry.phone) : ""}</p>
      ${entry.notes ? `<small>${escapeHtml(entry.notes)}</small>` : ""}
      <button class="button compact" type="button" data-delete="${index}">Entfernen</button>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function toCsvValue(value) {
  return `"${String(value || "").replace(/"/g, "\"\"")}"`;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const signups = readSignups();

  signups.push({
    createdAt: new Date().toISOString(),
    student: data.get("student"),
    className: data.get("className"),
    guardian: data.get("guardian"),
    email: data.get("email"),
    phone: data.get("phone"),
    trip: data.get("trip"),
    notes: data.get("notes")
  });

  writeSignups(signups);
  form.reset();
  renderSignups();
});

list.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const signups = readSignups();
  signups.splice(Number(button.dataset.delete), 1);
  writeSignups(signups);
  renderSignups();
});

exportButton.addEventListener("click", () => {
  const signups = readSignups();
  const headers = ["Zeitpunkt", "Name", "Klasse", "Erziehungsberechtigte", "E-Mail", "Telefon", "Fahrt", "Hinweise"];
  const rows = signups.map(entry => [
    entry.createdAt,
    entry.student,
    entry.className,
    entry.guardian,
    entry.email,
    entry.phone,
    entry.trip,
    entry.notes
  ]);

  const csv = [headers, ...rows].map(row => row.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gedenkstaettenfahrten-vormerkungen.csv";
  link.click();
  URL.revokeObjectURL(url);
});

renderSignups();
