const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const profileStorageKey = "erinnern-esr-student-profiles";
const teacherStorageKey = "erinnern-esr-teacher";
const teacherSessionKey = "erinnern-esr-teacher-active";
const officialParticipantsStorageKey = "erinnern-esr-official-participants-jg9";
const officialParticipantsVersionKey = "erinnern-esr-official-participants-version";
const officialParticipantsVersion = "2";

const exportButton = document.querySelector("#exportCsv");
const teacherSetupCard = document.querySelector("#teacherSetupCard");
const teacherLoginCard = document.querySelector("#teacherLoginCard");
const teacherSetupForm = document.querySelector("#teacherSetupForm");
const teacherLoginForm = document.querySelector("#teacherLoginForm");
const teacherStatus = document.querySelector("#teacherStatus");
const teacherInternalPanel = document.querySelector("#uebersicht");
const teacherStudentList = document.querySelector("#teacherStudentList");
const refreshTeacherData = document.querySelector("#refreshTeacherData");
const importOfficialParticipants = document.querySelector("#importOfficialParticipants");
const officialParticipantsBody = document.querySelector("#officialParticipantsBody");
const scheduleBody = document.querySelector("#scheduleBody");
const participantForm = document.querySelector("#participantForm");
const participantSubmit = document.querySelector("#participantSubmit");
const participantCancel = document.querySelector("#participantCancel");

let participantEditIndex = null;
let remoteTeacherStudents = [];

const defaultOfficialParticipants = [
  { className: "8a", name: "Fechner, Leni", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8a", name: "Jana Golitz", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8a", name: "Kraemer, Jan Paul", motivation: false, consent: true, gender: "Junge" },
  { className: "8a", name: "Ramadanaj, Leonit", motivation: true, consent: true, gender: "Junge" },
  { className: "8a", name: "Schermer, Isa", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8a", name: "Schubert Janna", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8d", name: "Akyildiz, Alim", motivation: true, consent: true, gender: "Junge" },
  { className: "8d", name: "Birkholz, Jule", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8e", name: "Assenmacher Hannah", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8e", name: "Karabulut, Merve", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8e", name: "Köhler, Felix", motivation: true, consent: true, gender: "Junge" },
  { className: "8e", name: "Leni Albert", motivation: true, consent: true, gender: "Mädchen" },
  { className: "8e", name: "Tim Helm", motivation: true, consent: true, gender: "Junge" },
  { className: "8e", name: "Wehr, Dominik", motivation: true, consent: true, gender: "Junge" },
  { className: "Lehrkraft", name: "Pia Westemeyer", motivation: false, consent: false },
  { className: "Lehrkraft", name: "Huran Tas", motivation: false, consent: false },
  { className: "9b", name: "Amiri Rima", motivation: true, consent: true },
  { className: "9b", name: "Belana Blahnik", motivation: true, consent: true },
  { className: "9b", name: "Gerharz Theresa", motivation: true, consent: true },
  { className: "9b", name: "Lenz Merle", motivation: false, consent: false },
  { className: "9b", name: "Ungan Ecrin", motivation: true, consent: true },
  { className: "9c", name: "David Sonnenwald", motivation: true, consent: true },
  { className: "9c", name: "Dobosch Annica", motivation: true, consent: true },
  { className: "9c", name: "Franken Robin", motivation: true, consent: true },
  { className: "9c", name: "Funck Juana", motivation: true, consent: true },
  { className: "9c", name: "Jakobsche Ksawery", motivation: true, consent: true },
  { className: "9c", name: "Mic Reuter", motivation: true, consent: true },
  { className: "9c", name: "Schmeer Deen", motivation: true, consent: true },
  { className: "9c", name: "Söhngen Leandro", motivation: true, consent: true },
  { className: "9c", name: "vom Hoff Elias", motivation: true, consent: true },
  { className: "9c", name: "Werbonat Tim", motivation: true, consent: true },
  { className: "9c, DAZ", name: "Leliuk Maksym", motivation: true, consent: true },
  { className: "9e", name: "Besic, Mubina", motivation: true, consent: true },
  { className: "9e", name: "Girdo, Asima", motivation: true, consent: true },
  { className: "9e", name: "Rogoznikar Helena", motivation: true, consent: true },
  { className: "9e", name: "van Deelen Maya", motivation: true, consent: false },
  { className: "Lehrkraft", name: "Julia Sonnenwald", motivation: false, consent: false },
  { className: "Lehrkraft", name: "Martin Reichert", motivation: false, consent: false }
];

const officialSchedule = [
  ["Mo., 09.11.2026", "07:25", "Abfahrt Europaschule Rheinberg", "Busparkplatz Dr.-Aloys-Wittrup-Straße", "Alle Schüler*innen pünktlich; Personalausweis mitnehmen."],
  ["Mo., 09.11.2026", "Vormittag", "Busfahrt nach Straßburg", "Bus", "Gepäck im Bus; Tagesrucksack bei SuS; organisatorische Hinweise zu Gruppen, Regeln und Programmpunkten; Ausgabe Reisejournale und Erklärung Reflexionsauftrag."],
  ["Mo., 09.11.2026", "Ankunft", "Check-in & Orientierung", "Hostel", "Orientierung im Hostel: Räume, Schlüssel, Sicherheitsregeln; Zimmerbezug; kurze Pause; Sammeln im Gemeinschaftsraum."],
  ["Mo., 09.11.2026", "Nachmittag", "Besuch der Gedenkstätte Straßburg", "Gedenkstätte Straßburg", "Einführung zur historischen Bedeutung der Region; geführte Besichtigung; Arbeitsauftrag: perspektivisches Schreiben, Analyse ausgewählter Gedenktafeln, fotografische Dokumentation für Ausstellung."],
  ["Mo., 09.11.2026", "Abendessen", "Gemeinsames Essen", "Hostel", "Gemeinsames Abendessen; kurzes Briefing für Tag 2."],
  ["Mo., 09.11.2026", "Abend", "Reflexionsrunde", "Hostel", "Austausch im Plenum: „Was nehme ich heute mit?“; erste Journal-Einträge zu Erwartungen, Eindrücken und Fragen."],
  ["Di., 10.11.2026", "Vormittag", "Abfahrt zum KZ Natzweiler-Struthof", "Bus / Vogesenraum", "Fahrt in den Vogesenraum; Vorabgespräch im Bus zu Verhalten auf ehemaligen Lagergeländen und Bedeutung des Ortes."],
  ["Di., 10.11.2026", "Vormittag / Mittag", "Geführter Rundgang in zwei Gruppen", "KZ Natzweiler-Struthof", "Lagergelände mit Kommandantur, Zellenbau und Appellplatz; Themen: Zwangsarbeit, Alltag der Häftlinge, Deportationswege, Widerstand und Überlebensstrategien."],
  ["Di., 10.11.2026", "Nachmittag", "Museumsbesuch", "Museum KZ Natzweiler-Struthof", "Ausstellung zur Geschichte des Lagers aus französischer Perspektive; interaktive Arbeitsphasen an Medienstationen."],
  ["Di., 10.11.2026", "Nachmittag", "Arbeitsphase: Biografien ehemaliger Häftlinge", "Museum / Arbeitsräume", "Gruppenarbeit mit vorbereitetem Biografie-Paket; Ergebnisse im Journal dokumentieren und später in Rheinberg weiterbearbeiten."],
  ["Di., 10.11.2026", "Abend", "Rückkehr, Essen & Journalarbeit", "Hostel", "Gemeinsames Abendessen; schriftliche Verarbeitung des Tages als Pflichtteil."],
  ["Mi., 11.11.2026", "Vormittag", "Europäisches Parlament Straßburg", "Europäisches Parlament", "Einlass und Sicherheitskontrolle; Einführung durch Mitarbeiter*innen zu Aufbau der EU, Rolle des Parlaments sowie Arbeitsprozessen und Gesetzgebungswegen."],
  ["Mi., 11.11.2026", "Vormittag / Mittag", "Planspiel: EU-Entscheidungsprozesse erleben", "Europäisches Parlament", "SuS übernehmen Rollen von Abgeordneten; Bearbeitung eines Gesetzesvorschlags; Diskussion, Antragstellung, Ausschussdebatten und fiktive Plenarsitzung."],
  ["Mi., 11.11.2026", "Nachmittag", "Austausch & Fragerunde", "Europäisches Parlament", "Eigene Fragen stellen; Reflexionsrunde zu europäischer Demokratie."],
  ["Mi., 11.11.2026", "Später Nachmittag", "Freizeit in Kleingruppen", "Straßburg Innenstadt", "Bewegung in zugeteilten Gruppen; Aufsichtsrouten festgelegt; Aufgaben: Recherche zur europäischen Identität Straßburgs und Fotodokumentation „Europa vor Ort“."],
  ["Mi., 11.11.2026", "Abend", "Reflexion im Hostel", "Hostel", "Austausch: „Wie funktioniert Demokratie auf EU-Ebene?“; Journalfortsetzung."],
  ["Do., 12.11.2026", "09:00", "Abfahrt vom Hostel", "Hostel / Bus", "Abfahrt zum Musée Alsace."],
  ["Do., 12.11.2026", "11:00", "Geführter Rundgang im Musée Alsace", "Musée Alsace", "Einführung in die Regionalgeschichte: Elsass zwischen Deutschland und Frankreich; Besuch verschiedener Themenhäuser; Erkundungsbogen „Wie verändert Erinnerung Kultur?“; zwei Gruppen parallel geführt."],
  ["Do., 12.11.2026", "12:30", "Arbeitsphase", "Musée Alsace", "Kleingruppen dokumentieren je ein Themenhaus; Ergebnisse fließen später in die Ausstellung ein."],
  ["Do., 12.11.2026", "14:30", "Zeitzeugenunterricht", "Musée Alsace / Seminarraum", "Begegnung mit einer Person mit familiären oder persönlichen Erfahrungen zu Krieg, Vertreibung oder Grenzregionsthemen; Frageblock durch SuS vorbereitet."],
  ["Do., 12.11.2026", "18:00", "Abendessen im Flammkuchenhaus", "Flammkuchenhaus", "Gemeinsames Essen als Abschluss des offiziellen Programms."],
  ["Do., 12.11.2026", "20:00", "Abschluss- und Feedbackrunde", "Hostel", "Reflexion der Woche; Übergabe kleiner Aufgaben für die Nachbereitung; Fotosichtung und Projektankündigung „Ausstellung Straßburg 2026“."],
  ["Fr., 13.11.2026", "02:06", "Abfahrt Straßburg", "Gare Centrale Straßburg", "Nachtfahrt zurück nach Rheinberg; Ruhezeit im Bus; abschließende organisatorische Hinweise."],
  ["Fr., 13.11.2026", "Ankunft", "Ankunft an der Europaschule Rheinberg", "Europaschule Rheinberg", "Ausgabe letzter Materialien; Verabschiedung; Hinweis auf Nachbereitungsprojekt im Unterricht."]
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

function readSignups() {
  return readJson(signupStorageKey, []);
}

function readStudents() {
  return readJson(studentStorageKey, []);
}

function readProfiles() {
  return readJson(profileStorageKey, {});
}

function writeProfiles(profiles) {
  writeJson(profileStorageKey, profiles);
}

function readOfficialParticipants() {
  const stored = readJson(officialParticipantsStorageKey, null);
  const storedVersion = localStorage.getItem(officialParticipantsVersionKey);

  if (!stored) {
    writeOfficialParticipants(defaultOfficialParticipants);
    localStorage.setItem(officialParticipantsVersionKey, officialParticipantsVersion);
    return defaultOfficialParticipants;
  }

  if (storedVersion !== officialParticipantsVersion) {
    const merged = mergeParticipants(defaultOfficialParticipants, stored);
    writeOfficialParticipants(merged);
    localStorage.setItem(officialParticipantsVersionKey, officialParticipantsVersion);
    return merged;
  }

  return stored;
}

function writeOfficialParticipants(participants) {
  writeJson(officialParticipantsStorageKey, participants);
}

function participantKey(participant) {
  return `${String(participant.className || "").trim().toLowerCase()}|${String(participant.name || "").trim().toLowerCase()}`;
}

function mergeParticipants(baseParticipants, extraParticipants) {
  const byKey = new Map();
  baseParticipants.forEach(participant => {
    byKey.set(participantKey(participant), participant);
  });
  extraParticipants.forEach(participant => {
    byKey.set(participantKey(participant), {
      className: participant.className || "",
      name: participant.name || "",
      motivation: Boolean(participant.motivation),
      consent: Boolean(participant.consent),
      gender: participant.gender || ""
    });
  });
  return sortParticipants([...byKey.values()]);
}

function sortParticipants(participants) {
  return [...participants].sort((a, b) => {
    const classCompare = String(a.className).localeCompare(String(b.className), "de", { numeric: true });
    if (classCompare) return classCompare;
    return String(a.name).localeCompare(String(b.name), "de");
  });
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

async function loadRemoteTeacherStudents() {
  const teacher = getTeacherAccount();
  if (!teacher?.pin) return;

  const response = await fetch("/api/teacher/students", {
    headers: { "X-Teacher-Pin": teacher.pin }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Railway-Schülerdaten konnten nicht geladen werden.");
  }

  remoteTeacherStudents = data.students || [];

  const profiles = readProfiles();
  remoteTeacherStudents.forEach(student => {
    profiles[student.id] = student.profile || {};
  });
  writeProfiles(profiles);
}

function collectTeacherStudents() {
  const byKey = new Map();
  const profiles = readProfiles();

  readOfficialParticipants().forEach(participant => {
    if (participant.className === "Lehrkraft") return;
    byKey.set(participantKey(participant), {
      name: participant.name,
      className: participant.className,
      email: "",
      guardian: "",
      phone: "",
      trip: participant.className?.startsWith("9") ? "Straßburgfahrt 2026 - Jahrgang 9" : "Straßburgfahrt 2026 - Jahrgang 8",
      source: "Importierte TN-Liste",
      motivation: participant.motivation,
      consent: participant.consent,
      profile: {}
    });
  });

  readStudents().forEach(student => {
    const importedKey = participantKey(student);
    const key = byKey.has(importedKey) ? importedKey : (student.email || student.id);
    const existing = byKey.get(key);
    const profile = profiles[student.id] || existing?.profile || {};
    byKey.set(key, {
      name: student.name,
      className: student.className,
      email: student.email,
      guardian: profile.parent1Name || existing?.guardian || "",
      phone: profile.parent1Phone || existing?.phone || "",
      trip: existing?.trip || "",
      source: existing ? `${existing.source} + Registriert` : "Registriert",
      motivation: existing?.motivation || "",
      consent: existing?.consent || "",
      profile
    });
  });

  remoteTeacherStudents.forEach(student => {
    const importedKey = participantKey(student);
    const key = byKey.has(importedKey) ? importedKey : (student.email || student.id);
    const existing = byKey.get(key);
    const profile = student.profile || profiles[student.id] || {};
    const hasConsentImage = Boolean(student.documents?.consentImage);
    const hasSignature = Boolean(student.documents?.signature);
    byKey.set(key, {
      name: student.name || existing?.name || "",
      className: student.className || existing?.className || "",
      email: student.email || existing?.email || "",
      guardian: profile.parent1Name || existing?.guardian || "",
      phone: profile.parent1Phone || existing?.phone || "",
      trip: existing?.trip || "",
      source: existing ? `${existing.source} + Railway` : "Railway",
      motivation: existing?.motivation || "",
      consent: existing?.consent || hasConsentImage,
      uploadedConsent: hasConsentImage,
      signature: hasSignature,
      profile
    });
  });

  readSignups().forEach(signup => {
    const signupKey = participantKey({ className: signup.className, name: signup.student });
    const key = byKey.has(signupKey) ? signupKey : (signup.email || signupKey);
    const existing = byKey.get(key);
    byKey.set(key, {
      name: signup.student || existing?.name || "",
      className: signup.className || existing?.className || "",
      email: signup.email || existing?.email || "",
      guardian: signup.guardian || "",
      phone: signup.phone || "",
      trip: signup.trip || "",
      source: existing ? `${existing.source} + Vormerkung` : "Vormerkung",
      motivation: existing?.motivation || "",
      consent: existing?.consent || "",
      profile: signup.profile || existing?.profile || {}
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
              <th>Gesundheit / Hinweise</th>
              <th>Fahrt</th>
              <th>Unterlagen</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(student => `
              <tr>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.email)}</td>
                <td>${escapeHtml([student.guardian, student.phone].filter(Boolean).join(" | "))}</td>
                <td>${escapeHtml([
                  student.profile?.allergies ? `Allergien: ${student.profile.allergies}` : "",
                  student.profile?.medication ? `Medizin: ${student.profile.medication}` : "",
                  student.profile?.food ? `Ernährung: ${student.profile.food}` : "",
                  student.profile?.supportNotes || ""
                ].filter(Boolean).join(" | "))}</td>
                <td>${escapeHtml(student.trip)}</td>
                <td>${[
                  student.motivation ? "Motivation" : "",
                  student.consent ? "Einverständnis" : "",
                  student.uploadedConsent ? "Upload" : "",
                  student.signature ? "Unterschrift" : ""
                ].filter(Boolean).join(" | ")}</td>
                <td>${escapeHtml(student.source)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `).join("");
}

function renderOfficialParticipants() {
  const participants = readOfficialParticipants();

  officialParticipantsBody.innerHTML = participants.map((participant, index) => `
    <tr>
      <td>${escapeHtml(participant.className)}</td>
      <td>${escapeHtml(participant.name)}</td>
      <td>${participant.motivation ? "x" : ""}</td>
      <td>${participant.consent ? "x" : ""}</td>
      <td>
        <div class="row-actions">
          <button class="button compact" type="button" data-edit-participant="${index}">Bearbeiten</button>
          <button class="button compact" type="button" data-delete-participant="${index}">Entfernen</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function resetParticipantForm() {
  participantEditIndex = null;
  participantForm.reset();
  participantSubmit.textContent = "Schüler hinzufügen";
  participantCancel.classList.add("hidden");
}

function startParticipantEdit(index) {
  const participant = readOfficialParticipants()[index];
  if (!participant) return;

  participantEditIndex = index;
  participantForm.elements.className.value = participant.className;
  participantForm.elements.name.value = participant.name;
  participantForm.elements.motivation.checked = Boolean(participant.motivation);
  participantForm.elements.consent.checked = Boolean(participant.consent);
  participantSubmit.textContent = "Änderung speichern";
  participantCancel.classList.remove("hidden");
  participantForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function removeParticipant(index) {
  const participants = readOfficialParticipants();
  participants.splice(index, 1);
  writeOfficialParticipants(participants);
  resetParticipantForm();
  renderOfficialParticipants();
  renderTeacherStudents();
}

function renderSchedule() {
  scheduleBody.innerHTML = officialSchedule.map(([date, time, program, place, details]) => `
    <tr>
      <td>${escapeHtml(date)}</td>
      <td>${escapeHtml(time)}</td>
      <td>${escapeHtml(program)}</td>
      <td>${escapeHtml(place)}</td>
      <td>${escapeHtml(details)}</td>
    </tr>
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
  renderOfficialParticipants();
  renderSchedule();
  loadRemoteTeacherStudents()
    .then(() => {
      renderTeacherStudents();
      teacherStatus.querySelector(".remote-load-status")?.remove();
    })
    .catch(error => {
      const status = teacherStatus.querySelector(".remote-load-status");
      if (status) status.textContent = error.message;
    });
  teacherStatus.innerHTML = `
    <strong>Lehrerbereich geöffnet</strong>
    <p>${escapeHtml(teacher.name)} kann die gespeicherten Vormerkungen einsehen und exportieren.</p>
    <p class="remote-load-status">Railway-Schülerdaten werden geladen …</p>
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

refreshTeacherData.addEventListener("click", async () => {
  try {
    await loadRemoteTeacherStudents();
    renderTeacherStudents();
    renderOfficialParticipants();
    renderTeacher("Daten aktualisiert.");
  } catch (error) {
    renderTeacher(error.message);
  }
});

importOfficialParticipants.addEventListener("click", () => {
  const merged = mergeParticipants(defaultOfficialParticipants, readOfficialParticipants());
  writeOfficialParticipants(merged);
  localStorage.setItem(officialParticipantsVersionKey, officialParticipantsVersion);
  resetParticipantForm();
  renderOfficialParticipants();
  renderTeacherStudents();
  renderTeacher("Namen aus der Tabelle importiert.");
});

participantForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(participantForm);
  const participants = readOfficialParticipants();
  const participant = {
    className: String(data.get("className") || "").trim(),
    name: String(data.get("name") || "").trim(),
    motivation: data.has("motivation"),
    consent: data.has("consent")
  };

  if (participantEditIndex === null) {
    participants.push(participant);
  } else {
    participants[participantEditIndex] = participant;
  }

  writeOfficialParticipants(sortParticipants(participants));
  resetParticipantForm();
  renderOfficialParticipants();
  renderTeacherStudents();
});

participantCancel.addEventListener("click", resetParticipantForm);

officialParticipantsBody.addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit-participant]");
  const deleteButton = event.target.closest("[data-delete-participant]");

  if (editButton) {
    startParticipantEdit(Number(editButton.dataset.editParticipant));
    return;
  }

  if (deleteButton) {
    removeParticipant(Number(deleteButton.dataset.deleteParticipant));
  }
});

exportButton.addEventListener("click", () => {
  const students = collectTeacherStudents();
  const headers = ["Name", "Klasse", "E-Mail", "Kontakt 1", "Telefon 1", "E-Mail Kontakt 1", "Kontakt 2", "Telefon 2", "E-Mail Kontakt 2", "Allergien", "Medikamente", "Ernaehrung", "Schwimmen", "Weitere Hinweise", "Fahrt", "Motivationsschreiben", "Einverstaendniserklaerung", "Status"];
  const rows = students.map(entry => [
    entry.name,
    entry.className,
    entry.email,
    entry.profile?.parent1Name || entry.guardian,
    entry.profile?.parent1Phone || entry.phone,
    entry.profile?.parent1Email || "",
    entry.profile?.parent2Name || "",
    entry.profile?.parent2Phone || "",
    entry.profile?.parent2Email || "",
    entry.profile?.allergies || "",
    entry.profile?.medication || "",
    entry.profile?.food || "",
    entry.profile?.swimming || "",
    entry.profile?.supportNotes || "",
    entry.trip,
    entry.motivation ? "ja" : "",
    entry.consent ? "ja" : "",
    entry.source
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
