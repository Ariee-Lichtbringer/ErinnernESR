const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const teacherStorageKey = "erinnern-esr-teacher";
const teacherSessionKey = "erinnern-esr-teacher-active";

const exportButton = document.querySelector("#exportCsv");
const teacherSetupCard = document.querySelector("#teacherSetupCard");
const teacherLoginCard = document.querySelector("#teacherLoginCard");
const teacherSetupForm = document.querySelector("#teacherSetupForm");
const teacherLoginForm = document.querySelector("#teacherLoginForm");
const teacherStatus = document.querySelector("#teacherStatus");
const teacherInternalPanel = document.querySelector("#uebersicht");
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

function readStudents() {
  return readJson(studentStorageKey, []);
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
  teacherLoginCard.classList.toggle("hidden", !teacher || Boolean(active));
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
    <a class="button primary" href="#uebersicht">Zur Übersicht</a>
    <button class="button compact" type="button" id="teacherLogoutButton">Lehrerbereich schließen</button>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;
}

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

renderTeacher();
