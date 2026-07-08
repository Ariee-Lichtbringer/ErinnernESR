const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const documentStorageKey = "erinnern-esr-student-documents";
const profileStorageKey = "erinnern-esr-student-profiles";
const studentSessionStorageKey = "erinnern-esr-active-student";
const studentSessionDataStorageKey = "erinnern-esr-active-student-data";
const studentSessionTokenStorageKey = "erinnern-esr-session-token";
const teacherStorageKey = "erinnern-esr-teacher";
const teacherAccountsStorageKey = "erinnern-esr-teacher-accounts";
const teacherSessionKey = "erinnern-esr-teacher-active";
const teacherAdminSessionKey = "erinnern-esr-teacher-admin-active";
const teacherAdminName = "SON";
const teacherAdminPasswordConfigured = false;
const paymentStorageKey = "erinnern-esr-payments";
const paymentTargetAmount = 250;
const officialParticipantsStorageKey = "erinnern-esr-official-participants-jg9";
const officialParticipantsVersionKey = "erinnern-esr-official-participants-version";
const officialParticipantsVersion = "2";

const exportButton = document.querySelector("#exportCsv");
const teacherSetupCard = document.querySelector("#teacherSetupCard");
const teacherLoginCard = document.querySelector("#teacherLoginCard");
const teacherSetupForm = document.querySelector("#teacherSetupForm");
const teacherLoginForm = document.querySelector("#teacherLoginForm");
const teacherAdminCard = document.querySelector("#teacherAdminCard");
const teacherAdminForm = document.querySelector("#teacherAdminForm");
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

function writeStudents(students) {
  writeJson(studentStorageKey, students);
}

function writeSignups(signups) {
  writeJson(signupStorageKey, signups);
}

function readProfiles() {
  return readJson(profileStorageKey, {});
}

function writeProfiles(profiles) {
  writeJson(profileStorageKey, profiles);
}

function readDocuments() {
  return readJson(documentStorageKey, {});
}

function writeDocuments(documents) {
  writeJson(documentStorageKey, documents);
}

function readPayments() {
  return readJson(paymentStorageKey, {});
}

function writePayments(payments) {
  writeJson(paymentStorageKey, payments);
}

function normalizePaymentAmount(value) {
  const amount = Number.parseFloat(String(value || "0").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.min(paymentTargetAmount, Math.round(amount * 100) / 100);
}

function formatEuro(value) {
  return `${normalizePaymentAmount(value).toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} EUR`;
}

function normalizeGender(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["männlich", "maennlich", "m", "junge"].includes(normalized)) return "männlich";
  if (["weiblich", "w", "mädchen", "maedchen"].includes(normalized)) return "weiblich";
  return "";
}

function studentPaymentKey(student) {
  return participantKey({
    className: student.className || "",
    name: student.name || student.email || ""
  });
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

function normalizeTeacherId(name) {
  return String(name || "").trim().toLowerCase();
}

function createTeacherAccount(name, pin, status = "pending") {
  const trimmedName = String(name || "").trim();
  return {
    id: normalizeTeacherId(trimmedName),
    name: trimmedName,
    pin: String(pin || ""),
    status,
    requestedAt: new Date().toISOString()
  };
}

function readTeacherAccounts() {
  const accounts = readJson(teacherAccountsStorageKey, []);

  if (accounts.length) return accounts;

  const legacyTeacher = readJson(teacherStorageKey, null);
  if (!legacyTeacher?.name || !legacyTeacher?.pin) return [];

  const migrated = [createTeacherAccount(legacyTeacher.name, legacyTeacher.pin, "approved")];
  writeTeacherAccounts(migrated);
  return migrated;
}

function writeTeacherAccounts(accounts) {
  writeJson(teacherAccountsStorageKey, accounts);
}

function findTeacherAccount(name) {
  const id = normalizeTeacherId(name);
  return readTeacherAccounts().find(account => account.id === id);
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
  if (isTeacherAdminActive()) {
    return { id: "admin-son", name: teacherAdminName, role: "admin", status: "approved" };
  }

  const activeTeacherId = localStorage.getItem(teacherSessionKey);
  if (!activeTeacherId) return null;

  return readTeacherAccounts().find(account => account.id === activeTeacherId && account.status === "approved") || null;
}

function setTeacherActive(account) {
  if (account?.id) {
    localStorage.setItem(teacherSessionKey, account.id);
  } else {
    localStorage.removeItem(teacherSessionKey);
  }
}

function isTeacherActive() {
  return Boolean(getTeacherAccount());
}

function setTeacherAdminActive(active) {
  if (active) {
    localStorage.setItem(teacherAdminSessionKey, "true");
    localStorage.removeItem(teacherSessionKey);
  } else {
    localStorage.removeItem(teacherAdminSessionKey);
  }
}

function isTeacherAdminActive() {
  return localStorage.getItem(teacherAdminSessionKey) === "true";
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

async function resetRemoteStudentAccount(studentId) {
  const teacher = getTeacherAccount();
  if (!studentId || !teacher?.pin || isTeacherAdminActive()) return;

  const response = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}`, {
    method: "DELETE",
    headers: { "X-Teacher-Pin": teacher.pin }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Schüleraccount konnte auf dem Server nicht zurückgesetzt werden.");
  }
}

function resetLocalStudentAccount({ studentId, email, paymentKey }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  writeStudents(readStudents().filter(student => (
    student.id !== studentId && String(student.email || "").trim().toLowerCase() !== normalizedEmail
  )));

  const profiles = readProfiles();
  const documents = readDocuments();
  if (studentId) {
    delete profiles[studentId];
    delete documents[studentId];
  }
  writeProfiles(profiles);
  writeDocuments(documents);

  const payments = readPayments();
  if (paymentKey) delete payments[paymentKey];
  writePayments(payments);

  writeSignups(readSignups().filter(signup => (
    signup.studentAccount !== studentId && String(signup.email || "").trim().toLowerCase() !== normalizedEmail
  )));

  if (localStorage.getItem(studentSessionStorageKey) === studentId) {
    localStorage.removeItem(studentSessionStorageKey);
    localStorage.removeItem(studentSessionDataStorageKey);
    localStorage.removeItem(studentSessionTokenStorageKey);
  }

  remoteTeacherStudents = remoteTeacherStudents.filter(student => (
    student.id !== studentId && String(student.email || "").trim().toLowerCase() !== normalizedEmail
  ));
}

function collectTeacherStudents() {
  const byKey = new Map();
  const profiles = readProfiles();

  readOfficialParticipants().forEach(participant => {
    if (participant.className === "Lehrkraft") return;
    byKey.set(participantKey(participant), {
      studentId: "",
      name: participant.name,
      className: participant.className,
      email: "",
      guardian: "",
      phone: "",
      trip: "Straßburgfahrt 2026",
      source: "Importierte TN-Liste",
      motivation: participant.motivation,
      consent: participant.consent,
      gender: normalizeGender(participant.gender),
      profile: {}
    });
  });

  readStudents().forEach(student => {
    const importedKey = participantKey(student);
    const key = byKey.has(importedKey) ? importedKey : (student.email || student.id);
    const existing = byKey.get(key);
    const profile = profiles[student.id] || existing?.profile || {};
    byKey.set(key, {
      studentId: student.id || "",
      name: student.name,
      className: student.className,
      email: student.email,
      guardian: profile.parent1Name || existing?.guardian || "",
      phone: profile.parent1Phone || existing?.phone || "",
      trip: student.trip || existing?.trip || "",
      source: existing ? `${existing.source} + Registriert` : "Registriert",
      motivation: existing?.motivation || "",
      consent: existing?.consent || "",
      gender: existing?.gender || "",
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
      studentId: student.id || existing?.studentId || "",
      name: student.name || existing?.name || "",
      className: student.className || existing?.className || "",
      email: student.email || existing?.email || "",
      guardian: profile.parent1Name || existing?.guardian || "",
      phone: profile.parent1Phone || existing?.phone || "",
      trip: student.trip || existing?.trip || "",
      source: existing ? `${existing.source} + Railway` : "Railway",
      motivation: existing?.motivation || "",
      consent: existing?.consent || hasConsentImage,
      uploadedConsent: hasConsentImage,
      signature: hasSignature,
      gender: existing?.gender || "",
      profile
    });
  });

  readSignups().forEach(signup => {
    const signupKey = participantKey({ className: signup.className, name: signup.student });
    const key = byKey.has(signupKey) ? signupKey : (signup.email || signupKey);
    const existing = byKey.get(key);
    byKey.set(key, {
      studentId: signup.studentAccount || existing?.studentId || "",
      name: signup.student || existing?.name || "",
      className: signup.className || existing?.className || "",
      email: signup.email || existing?.email || "",
      guardian: signup.guardian || "",
      phone: signup.phone || "",
      trip: signup.trip || "",
      source: existing ? `${existing.source} + Vormerkung` : "Vormerkung",
      motivation: existing?.motivation || "",
      consent: existing?.consent || "",
      gender: existing?.gender || "",
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
  const payments = readPayments();

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
            ${entries.map(student => {
              const paymentKey = studentPaymentKey(student);
              const paidAmount = normalizePaymentAmount(payments[paymentKey]);
              const openAmount = Math.max(paymentTargetAmount - paidAmount, 0);
              const progress = Math.min((paidAmount / paymentTargetAmount) * 100, 100);

              return `
                <tr>
                  <td>
                    <div class="student-name-payment">
                      <strong>${escapeHtml(student.name)}</strong>
                      ${student.gender ? `<small>${escapeHtml(student.gender)}</small>` : ""}
                      <div class="payment-progress" aria-label="Zahlungsstand ${escapeHtml(student.name)}">
                        <span style="width: ${progress}%"></span>
                      </div>
                      <div class="payment-summary">
                        <span>${formatEuro(paidAmount)} gezahlt</span>
                        <span>${formatEuro(openAmount)} offen</span>
                      </div>
                      <label class="payment-input">
                        <span>Gezahlt</span>
                        <input type="number" min="0" max="${paymentTargetAmount}" step="1" value="${paidAmount}" data-payment-key="${escapeHtml(paymentKey)}">
                      </label>
                    </div>
                  </td>
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
                  <td>
                    <div class="account-actions">
                      <span>${escapeHtml(student.source)}</span>
                      ${student.email || student.studentId ? `
                        <button
                          class="button compact danger-button"
                          type="button"
                          data-reset-student
                          data-student-id="${escapeHtml(student.studentId)}"
                          data-student-email="${escapeHtml(student.email)}"
                          data-payment-key="${escapeHtml(paymentKey)}"
                        >Account zurücksetzen</button>
                      ` : ""}
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
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
      <td>${escapeHtml(normalizeGender(participant.gender))}</td>
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
  participantForm.elements.gender.value = normalizeGender(participant.gender);
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

function renderTeacherApprovalPanel() {
  const accounts = readTeacherAccounts();
  const pending = accounts.filter(account => account.status === "pending");
  const approved = accounts.filter(account => account.status === "approved");

  const pendingMarkup = pending.length
    ? pending.map(account => `
      <div class="approval-row">
        <div>
          <strong>${escapeHtml(account.name)}</strong>
          <p>Wartet auf Freigabe.</p>
        </div>
        <div class="approval-actions">
          <button class="button compact" type="button" data-teacher-approve="${escapeHtml(account.id)}">Freigeben</button>
          <button class="button compact danger-button" type="button" data-teacher-reject="${escapeHtml(account.id)}">Ablehnen</button>
        </div>
      </div>
    `).join("")
    : "<p>Keine offenen Lehrer-Anträge.</p>";

  const approvedMarkup = approved.length
    ? approved.map(account => `<li>${escapeHtml(account.name)}</li>`).join("")
    : "<li>Noch keine freigegebenen Lehrkräfte.</li>";

  return `
    <div class="teacher-approval-panel">
      <h4>Lehrerzugänge freigeben</h4>
      ${pendingMarkup}
      <h4>Freigegebene Lehrkräfte</h4>
      <ul>${approvedMarkup}</ul>
    </div>
  `;
}

function renderTeacher(message = "") {
  const teacher = getTeacherAccount();
  const active = Boolean(teacher);
  const adminActive = isTeacherAdminActive();
  const hasPendingAccounts = readTeacherAccounts().some(account => account.status === "pending");

  teacherSetupCard.classList.toggle("hidden", active);
  teacherLoginCard.classList.toggle("hidden", active);
  teacherAdminCard.classList.toggle("hidden", active);
  teacherInternalPanel.classList.toggle("hidden", !active);

  if (!active) {
    teacherStatus.innerHTML = `
      <strong>Lehrerzugang geschützt</strong>
      <p>Neue Lehrerzugänge müssen zuerst durch Admin ${teacherAdminName} freigegeben werden.</p>
      ${hasPendingAccounts ? "<p>Es gibt offene Lehrer-Anträge im Adminbereich.</p>" : ""}
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
    `;
    return;
  }

  renderTeacherStudents();
  renderOfficialParticipants();
  renderSchedule();

  if (!adminActive) {
    loadRemoteTeacherStudents()
      .then(() => {
        renderTeacherStudents();
        teacherStatus.querySelector(".remote-load-status")?.remove();
      })
      .catch(error => {
        const status = teacherStatus.querySelector(".remote-load-status");
        if (status) status.textContent = error.message;
      });
  }

  teacherStatus.innerHTML = `
    <strong>${adminActive ? "Adminbereich geöffnet" : "Lehrerbereich geöffnet"}</strong>
    <p>${escapeHtml(teacher.name)} kann die gespeicherten Vormerkungen einsehen und exportieren.</p>
    ${adminActive ? renderTeacherApprovalPanel() : "<p class=\"remote-load-status\">Railway-Schülerdaten werden geladen …</p>"}
    <a class="button primary" href="#uebersicht">Zur Übersicht</a>
    <button class="button compact" type="button" id="teacherLogoutButton">Lehrerbereich schließen</button>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;
}

teacherSetupForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(teacherSetupForm);
  const name = String(data.get("teacherName") || "").trim();
  const pin = String(data.get("teacherPin") || "");
  const existing = findTeacherAccount(name);

  if (existing?.status === "approved") {
    renderTeacher("Für diese Lehrkraft ist bereits ein Zugang freigegeben.");
    return;
  }

  if (existing?.status === "pending") {
    renderTeacher("Dieser Lehrerzugang wartet bereits auf Admin-Freigabe.");
    return;
  }

  const accounts = readTeacherAccounts().filter(account => account.id !== normalizeTeacherId(name));
  accounts.push(createTeacherAccount(name, pin, "pending"));
  writeTeacherAccounts(accounts);
  teacherSetupForm.reset();
  renderTeacher("Lehrerzugang beantragt. Admin SON muss ihn zuerst freigeben.");
});

teacherLoginForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(teacherLoginForm);
  const name = String(data.get("teacherLoginName") || "").trim();
  const pin = String(data.get("teacherLoginPin") || "");
  const teacher = findTeacherAccount(name);

  if (!teacher || teacher.pin !== pin) {
    renderTeacher("Name oder Lehrer-PIN stimmt nicht.");
    return;
  }

  if (teacher.status !== "approved") {
    renderTeacher("Dieser Lehrerzugang ist noch nicht durch Admin SON freigegeben.");
    return;
  }

  setTeacherAdminActive(false);
  setTeacherActive(teacher);
  teacherLoginForm.reset();
  renderTeacher("Lehrerbereich geöffnet.");
});

teacherAdminForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(teacherAdminForm);
  const adminName = String(data.get("adminName") || "").trim();

  if (adminName !== teacherAdminName || !teacherAdminPasswordConfigured) {
    renderTeacher("Admin-Freigaben brauchen ein geschütztes Backend. Ein Admin-Passwort darf nicht öffentlich in GitHub Pages stehen.");
    return;
  }

  setTeacherAdminActive(true);
  teacherAdminForm.reset();
  renderTeacher("Adminbereich geöffnet.");
});

teacherStatus.addEventListener("click", event => {
  const approveButton = event.target.closest("[data-teacher-approve]");
  const rejectButton = event.target.closest("[data-teacher-reject]");
  const logoutButton = event.target.closest("#teacherLogoutButton");

  if (approveButton && isTeacherAdminActive()) {
    const id = approveButton.dataset.teacherApprove;
    const accounts = readTeacherAccounts().map(account => (
      account.id === id ? { ...account, status: "approved", approvedAt: new Date().toISOString() } : account
    ));
    writeTeacherAccounts(accounts);
    renderTeacher("Lehrerzugang freigegeben.");
    return;
  }

  if (rejectButton && isTeacherAdminActive()) {
    const id = rejectButton.dataset.teacherReject;
    const accounts = readTeacherAccounts().filter(account => account.id !== id);
    writeTeacherAccounts(accounts);
    renderTeacher("Lehrerzugang abgelehnt.");
    return;
  }

  if (!logoutButton) return;
  setTeacherActive(null);
  setTeacherAdminActive(false);
  renderTeacher("Lehrerbereich geschlossen.");
});

teacherStudentList.addEventListener("input", event => {
  const input = event.target.closest("[data-payment-key]");
  if (!input) return;

  const payments = readPayments();
  const paidAmount = normalizePaymentAmount(input.value);
  payments[input.dataset.paymentKey] = paidAmount;
  writePayments(payments);

  const paymentBlock = input.closest(".student-name-payment");
  const progress = Math.min((paidAmount / paymentTargetAmount) * 100, 100);
  const openAmount = Math.max(paymentTargetAmount - paidAmount, 0);
  const progressBar = paymentBlock?.querySelector(".payment-progress span");
  const summary = paymentBlock?.querySelector(".payment-summary");

  if (progressBar) progressBar.style.width = `${progress}%`;
  if (summary) {
    summary.innerHTML = `
      <span>${formatEuro(paidAmount)} gezahlt</span>
      <span>${formatEuro(openAmount)} offen</span>
    `;
  }
});

teacherStudentList.addEventListener("click", async event => {
  const button = event.target.closest("[data-reset-student]");
  if (!button) return;

  const studentId = button.dataset.studentId || "";
  const email = button.dataset.studentEmail || "";
  const paymentKey = button.dataset.paymentKey || "";
  const confirmed = window.confirm("Diesen Schüleraccount wirklich zurücksetzen? Der Zugang, gespeicherte Angaben und Unterlagen werden gelöscht.");
  if (!confirmed) return;

  button.disabled = true;

  try {
    await resetRemoteStudentAccount(studentId);
    resetLocalStudentAccount({ studentId, email, paymentKey });
    renderTeacherStudents();
    renderTeacher("Schüleraccount zurückgesetzt.");
  } catch (error) {
    resetLocalStudentAccount({ studentId, email, paymentKey });
    renderTeacherStudents();
    renderTeacher(`${error.message} Lokale Daten wurden zurückgesetzt.`);
  }
});

refreshTeacherData.addEventListener("click", async () => {
  if (isTeacherAdminActive()) {
    renderTeacherStudents();
    renderOfficialParticipants();
    renderTeacher("Lokale Daten aktualisiert.");
    return;
  }

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
    gender: normalizeGender(data.get("gender")),
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
  const payments = readPayments();
  const headers = ["Name", "Klasse", "Geschlecht", "Gezahlt", "Offen", "E-Mail", "Kontakt 1", "Telefon 1", "E-Mail Kontakt 1", "Kontakt 2", "Telefon 2", "E-Mail Kontakt 2", "Allergien", "Medikamente", "Ernaehrung", "Schwimmen", "Weitere Hinweise", "Fahrt", "Motivationsschreiben", "Einverstaendniserklaerung", "Status"];
  const rows = students.map(entry => {
    const paidAmount = normalizePaymentAmount(payments[studentPaymentKey(entry)]);
    return [
      entry.name,
      entry.className,
      entry.gender,
      paidAmount,
      Math.max(paymentTargetAmount - paidAmount, 0),
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
    ];
  });

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
