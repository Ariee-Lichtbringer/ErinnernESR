const studentStorageKey = "erinnern-esr-students";
const sessionStorageKey = "erinnern-esr-active-student";
const internalStorageKey = "erinnern-esr-internal";

const lockedPanel = document.querySelector("#lockedPanel");
const dashboardPanel = document.querySelector("#dashboardPanel");
const internalSections = document.querySelectorAll(".internal-section");
const studentGreeting = document.querySelector("#studentGreeting");
const studentMeta = document.querySelector("#studentMeta");
const taskList = document.querySelector("#taskList");
const journalForm = document.querySelector("#journalForm");
const journalMessage = document.querySelector("#journalMessage");
const internalLogout = document.querySelector("#internalLogout");

const defaultTasks = [
  "Personalausweis prüfen und für die Fahrt bereitlegen",
  "Reisejournal mitbringen",
  "Eine Frage zur Geschichte von Straßburg oder Natzweiler-Struthof vorbereiten",
  "Eine Frage zur europäischen Demokratie notieren",
  "Wetterfeste Kleidung und Tagesrucksack packen"
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getActiveStudent() {
  const activeId = localStorage.getItem(sessionStorageKey);
  if (!activeId) return null;
  return readJson(studentStorageKey, []).find(student => student.id === activeId) || null;
}

function readInternalData(studentId) {
  const allData = readJson(internalStorageKey, {});
  if (!allData[studentId]) {
    allData[studentId] = {
      tasks: defaultTasks.map(text => ({ text, done: false })),
      journal: { beforeTrip: "", reflection: "" }
    };
    writeJson(internalStorageKey, allData);
  }
  return allData[studentId];
}

function writeInternalData(studentId, data) {
  const allData = readJson(internalStorageKey, {});
  allData[studentId] = data;
  writeJson(internalStorageKey, allData);
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

function renderLocked() {
  lockedPanel.classList.remove("hidden");
  dashboardPanel.classList.add("hidden");
  internalSections.forEach(section => section.classList.add("hidden"));
  internalLogout.classList.add("hidden");
}

function renderInternal(student) {
  const data = readInternalData(student.id);
  lockedPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  internalSections.forEach(section => section.classList.remove("hidden"));
  internalLogout.classList.remove("hidden");

  studentGreeting.textContent = `Willkommen, ${student.name}`;
  studentMeta.textContent = `${student.className} | ${student.email}`;

  taskList.innerHTML = data.tasks.map((task, index) => `
    <label class="task-item">
      <input type="checkbox" data-task="${index}" ${task.done ? "checked" : ""}>
      <span>${escapeHtml(task.text)}</span>
    </label>
  `).join("");

  journalForm.elements.beforeTrip.value = data.journal.beforeTrip;
  journalForm.elements.reflection.value = data.journal.reflection;
}

function init() {
  const student = getActiveStudent();
  if (!student) {
    renderLocked();
    return;
  }
  renderInternal(student);
}

taskList.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-task]");
  const student = getActiveStudent();
  if (!checkbox || !student) return;

  const data = readInternalData(student.id);
  data.tasks[Number(checkbox.dataset.task)].done = checkbox.checked;
  writeInternalData(student.id, data);
});

journalForm.addEventListener("submit", event => {
  event.preventDefault();
  const student = getActiveStudent();
  if (!student) return;

  const data = readInternalData(student.id);
  data.journal.beforeTrip = journalForm.elements.beforeTrip.value;
  data.journal.reflection = journalForm.elements.reflection.value;
  writeInternalData(student.id, data);
  journalMessage.textContent = "Journal gespeichert.";
});

internalLogout.addEventListener("click", () => {
  localStorage.removeItem(sessionStorageKey);
  renderLocked();
});

init();
