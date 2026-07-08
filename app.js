const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const sessionStorageKey = "erinnern-esr-active-student";
const teacherStorageKey = "erinnern-esr-teacher";
const teacherSessionKey = "erinnern-esr-teacher-active";

const form = document.querySelector("#signupForm");
const list = document.querySelector("#signupList");
const exportButton = document.querySelector("#exportCsv");
const teacherPanel = document.querySelector("#teacherPanel");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const authStatus = document.querySelector("#authStatus");
const teacherSetupCard = document.querySelector("#teacherSetupCard");
const teacherLoginCard = document.querySelector("#teacherLoginCard");
const teacherSetupForm = document.querySelector("#teacherSetupForm");
const teacherLoginForm = document.querySelector("#teacherLoginForm");
const teacherStatus = document.querySelector("#teacherStatus");
const teacherInternalPanel = document.querySelector("#teacherInternalPanel");
const teacherStudentList = document.querySelector("#teacherStudentList");
const refreshTeacherData = document.querySelector("#refreshTeacherData");

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

function getTeacherAccount() {
  return readJson(teacherStorageKey, null);
}

function setTeacherActive(active) {
  if (active) {
    localStorage.setItem(teacherSessionKey, "true");
  } else {
    localStorage.removeItem(teacherSessionKey);
  }
}

function isTeacherActive() {
  return localStorage.getItem(teacherSessionKey) === "true";
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

function prefillSignup(student) {
  if (!student) return;
  form.elements.student.value = student.name;
  form.elements.className.value = student.className;
  form.elements.email.value = student.email;

  if (student.className.trim().startsWith("9")) {
    form.elements.trip.value = "Straßburgfahrt 2026 - Jahrgang 9";
  } else if (student.className.trim().startsWith("8")) {
    form.elements.trip.value = "Straßburgfahrt 2026 - Jahrgang 8";
  }
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

function collectTeacherStudents() {
  const byKey = new Map();

  readStudents().forEach(student => {
    const key = student.email || student.id;
    byKey.set(key, {
      name: student.name,
      className: student.className,
      email: student.email,
      source: "Registriert"
    });
  });

  readSignups().forEach(signup => {
    const key = signup.email || `${signup.student}-${signup.className}`;
    const existing = byKey.get(key);
    byKey.set(key, {
      name: signup.student || existing?.name || "",
      className: signup.className || existing?.className || "",
      email: signup.email || existing?.email || "",
      guardian: signup.guardian || "",
      phone: signup.phone || "",
      trip: signup.trip || "",
      source: existing ? "Registriert + Vormerkung" : "Vormerkung"
    });
  });

  return [...byKey.values()].sort((a, b) => {
    const classCompare = String(a.className).localeCompare(String(b.className), "de");
    if (classCompare) return classCompare;
    return String(a.name).localeCompare(String(b.name), "de");
  });
}

function renderTeacherStudents() {
  const students = collectTeacherStudents();

  if (!students.length) {
    teacherStudentList.innerHTML = "<p class=\"empty\">Noch keine registrierten Schüler oder Vormerkungen gespeichert.</p>";
    return;
  }

  const groups = students.reduce((result, student) => {
    const className = student.className || "ohne Klasse";
    result[className] = result[className] || [];
    result[className].push(student);
    return result;
  }, {});

  teacherStudentList.innerHTML = Object.entries(groups).map(([className, entries]) => `
    <section class="class-group">
      <h4>${escapeHtml(className)} <small>${entries.length} Person${entries.length === 1 ? "" : "en"}</small></h4>
      <div class="teacher-table-wrap">
        <table class="teacher-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Kontakt Eltern</th>
              <th>Fahrt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(student => `
              <tr>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.email)}</td>
                <td>${escapeHtml([student.guardian, student.phone].filter(Boolean).join(" | "))}</td>
                <td>${escapeHtml(student.trip)}</td>
                <td>${escapeHtml(student.source)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `).join("");
}

function renderTeacher(message = "") {
  const teacher = getTeacherAccount();
  const active = isTeacherActive() && teacher;

  teacherSetupCard.classList.toggle("hidden", Boolean(teacher));
  teacherLoginCard.classList.toggle("hidden", Boolean(active));
  teacherPanel.classList.toggle("hidden", !active);
  teacherInternalPanel.classList.toggle("hidden", !active);

  if (!teacher) {
    teacherStatus.innerHTML = `
      <strong>Noch kein lokaler Lehrerzugang</strong>
      <p>Richte auf diesem Gerät zuerst eine Lehrer-PIN ein. Danach kann die Verwaltung der Vormerkungen geöffnet werden.</p>
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
    `;
    return;
  }

  if (!active) {
    teacherStatus.innerHTML = `
      <strong>Lehrerzugang geschlossen</strong>
      <p>Die Vormerkungsliste und der CSV-Export sind erst nach Eingabe der Lehrer-PIN sichtbar.</p>
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
    `;
    return;
  }

  renderTeacherStudents();
  teacherStatus.innerHTML = `
    <strong>Lehrerbereich geöffnet</strong>
    <p>${escapeHtml(teacher.name)} kann die gespeicherten Vormerkungen einsehen und exportieren.</p>
    <a class="button primary" href="#anmeldung">Zu den Vormerkungen</a>
    <button class="button compact" type="button" id="teacherLogoutButton">Lehrerbereich schließen</button>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;
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

function toCsvValue(value) {
  return `"${String(value || "").replace(/"/g, "\"\"")}"`;
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

teacherSetupForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(teacherSetupForm);
  const teacher = {
    name: String(data.get("teacherName") || "").trim(),
    pin: String(data.get("teacherPin") || "")
  };

  writeJson(teacherStorageKey, teacher);
  setTeacherActive(true);
  teacherSetupForm.reset();
  renderTeacher("Lehrerzugang eingerichtet.");
});

teacherLoginForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(teacherLoginForm);
  const teacher = getTeacherAccount();
  const pin = String(data.get("teacherLoginPin") || "");

  if (!teacher || teacher.pin !== pin) {
    renderTeacher("Die Lehrer-PIN stimmt nicht.");
    return;
  }

  setTeacherActive(true);
  teacherLoginForm.reset();
  renderTeacher("Lehrerbereich geöffnet.");
});

teacherStatus.addEventListener("click", event => {
  const button = event.target.closest("#teacherLogoutButton");
  if (!button) return;
  setTeacherActive(false);
  renderTeacher("Lehrerbereich geschlossen.");
});

refreshTeacherData.addEventListener("click", () => {
  renderTeacherStudents();
  renderTeacher("Daten aktualisiert.");
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
  renderSignups();
  if (isTeacherActive()) renderTeacherStudents();
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
  const headers = ["Zeitpunkt", "Schuelerzugang", "Name", "Klasse", "Erziehungsberechtigte", "E-Mail", "Telefon", "Fahrt", "Hinweise"];
  const rows = signups.map(entry => [
    entry.createdAt,
    entry.studentAccount,
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

renderAuth();
renderTeacher();
renderSignups();
