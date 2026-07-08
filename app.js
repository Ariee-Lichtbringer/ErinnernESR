const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const sessionStorageKey = "erinnern-esr-active-student";

const form = document.querySelector("#signupForm");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const authStatus = document.querySelector("#authStatus");

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

function readSignups() {
  return readJson(signupStorageKey, []);
}

function writeSignups(signups) {
  writeJson(signupStorageKey, signups);
}

function readStudents() {
  return readJson(studentStorageKey, []);
}

function writeStudents(students) {
  writeJson(studentStorageKey, students);
}

function getActiveStudent() {
  const activeId = localStorage.getItem(sessionStorageKey);
  if (!activeId) return null;
  return readStudents().find(student => student.id === activeId) || null;
}

function setActiveStudent(student) {
  if (student) {
    localStorage.setItem(sessionStorageKey, student.id);
  } else {
    localStorage.removeItem(sessionStorageKey);
  }
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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function prefillSignup(student) {
  if (!student || !form) return;
  form.elements.student.value = student.name;
  form.elements.className.value = student.className;
  form.elements.email.value = student.email;

  if (student.className.trim().startsWith("9")) {
    form.elements.trip.value = "Straßburgfahrt 2026 - Jahrgang 9";
  } else if (student.className.trim().startsWith("8")) {
    form.elements.trip.value = "Straßburgfahrt 2026 - Jahrgang 8";
  }
}

function renderAuth(message = "") {
  const activeStudent = getActiveStudent();

  if (!activeStudent) {
    authStatus.innerHTML = `
      <strong>Nicht angemeldet</strong>
      <p>Lege einen Zugang an oder melde dich mit deiner Schul-E-Mail und PIN an. Danach werden Name, Klasse und E-Mail in die Vormerkung übernommen.</p>
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
    `;
    return;
  }

  authStatus.innerHTML = `
    <strong>Angemeldet</strong>
    <p>${escapeHtml(activeStudent.name)}<br>${escapeHtml(activeStudent.className)} | ${escapeHtml(activeStudent.email)}</p>
    <a class="button primary" href="intern.html">Interner Bereich</a>
    <a class="button primary" href="#anmeldung">Zur Vormerkung</a>
    <button class="button compact" type="button" id="logoutButton">Abmelden</button>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;
  prefillSignup(activeStudent);
}

registerForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const email = normalizeEmail(data.get("studentEmail"));
  const students = readStudents();

  if (students.some(student => student.email === email)) {
    renderAuth("Für diese E-Mail gibt es bereits einen Zugang.");
    return;
  }

  const student = {
    id: crypto.randomUUID(),
    name: String(data.get("studentName") || "").trim(),
    className: String(data.get("studentClass") || "").trim(),
    email,
    pin: String(data.get("studentPin") || "")
  };

  students.push(student);
  writeStudents(students);
  setActiveStudent(student);
  registerForm.reset();
  renderAuth("Zugang angelegt. Du bist jetzt angemeldet.");
});

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = normalizeEmail(data.get("loginEmail"));
  const pin = String(data.get("loginPin") || "");
  const student = readStudents().find(entry => entry.email === email && entry.pin === pin);

  if (!student) {
    renderAuth("E-Mail oder PIN stimmt nicht.");
    return;
  }

  setActiveStudent(student);
  loginForm.reset();
  renderAuth("Erfolgreich angemeldet.");
});

authStatus.addEventListener("click", event => {
  const button = event.target.closest("#logoutButton");
  if (!button) return;
  setActiveStudent(null);
  renderAuth("Du bist abgemeldet.");
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const signups = readSignups();
  const activeStudent = getActiveStudent();

  signups.push({
    createdAt: new Date().toISOString(),
    studentAccount: activeStudent ? activeStudent.id : "",
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
  if (activeStudent) prefillSignup(activeStudent);
  renderAuth("Vormerkung gespeichert.");
});

renderAuth();
