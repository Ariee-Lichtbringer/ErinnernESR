const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const sessionStorageKey = "erinnern-esr-active-student";
const sessionDataStorageKey = "erinnern-esr-active-student-data";
const sessionTokenStorageKey = "erinnern-esr-session-token";
const documentStorageKey = "erinnern-esr-student-documents";
const profileStorageKey = "erinnern-esr-student-profiles";

const form = document.querySelector("#signupForm");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const authStatus = document.querySelector("#authStatus");
const documentUploadForm = document.querySelector("#documentUploadForm");
const documentPreview = document.querySelector("#documentPreview");
const signaturePad = document.querySelector("#signaturePad");
const saveSignature = document.querySelector("#saveSignature");
const clearSignature = document.querySelector("#clearSignature");
const signaturePreview = document.querySelector("#signaturePreview");
const studentProfileForm = document.querySelector("#studentProfileForm");
const profileMessage = document.querySelector("#profileMessage");
const studentOnlyElements = document.querySelectorAll(".student-only");

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

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = localStorage.getItem(sessionTokenStorageKey);
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Speichern auf dem Server fehlgeschlagen.");
  }

  return data;
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

function readDocuments() {
  return readJson(documentStorageKey, {});
}

function writeDocuments(documents) {
  writeJson(documentStorageKey, documents);
}

function readProfiles() {
  return readJson(profileStorageKey, {});
}

function writeProfiles(profiles) {
  writeJson(profileStorageKey, profiles);
}

function getActiveStudent() {
  return readJson(sessionDataStorageKey, null);
}

function setActiveStudent(student, token = "") {
  if (student) {
    localStorage.setItem(sessionStorageKey, student.id);
    writeJson(sessionDataStorageKey, student);
    if (token) localStorage.setItem(sessionTokenStorageKey, token);
  } else {
    localStorage.removeItem(sessionStorageKey);
    localStorage.removeItem(sessionDataStorageKey);
    localStorage.removeItem(sessionTokenStorageKey);
  }
}

function getActiveStudentDocuments() {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return null;
  return readDocuments()[activeStudent.id] || {};
}

async function writeActiveStudentDocuments(update) {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return false;
  const documents = readDocuments();
  documents[activeStudent.id] = {
    ...(documents[activeStudent.id] || {}),
    ...update
  };
  await apiRequest("/api/students/me/documents", {
    method: "PUT",
    body: JSON.stringify({ documents: documents[activeStudent.id] })
  });
  writeDocuments(documents);
  return true;
}

function getActiveStudentProfile() {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return null;
  return readProfiles()[activeStudent.id] || {};
}

async function writeActiveStudentProfile(profile) {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return false;
  await apiRequest("/api/students/me/profile", {
    method: "PUT",
    body: JSON.stringify({ profile })
  });
  const profiles = readProfiles();
  profiles[activeStudent.id] = {
    ...(profiles[activeStudent.id] || {}),
    ...profile,
    updatedAt: new Date().toISOString()
  };
  writeProfiles(profiles);
  return true;
}

async function loadRemoteStudentData() {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return;

  const [profileResult, documentResult] = await Promise.all([
    apiRequest("/api/students/me/profile"),
    apiRequest("/api/students/me/documents")
  ]);

  const profiles = readProfiles();
  profiles[activeStudent.id] = profileResult.profile || {};
  writeProfiles(profiles);

  const documents = readDocuments();
  documents[activeStudent.id] = documentResult.documents || {};
  writeDocuments(documents);
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

function showStudentArea(target = "angaben") {
  const section = document.querySelector(`#${target}`);
  if (!section) return;
  window.location.hash = target;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStudentVisibility() {
  const activeStudent = getActiveStudent();
  studentOnlyElements.forEach(element => {
    element.classList.toggle("hidden", !activeStudent);
  });

  if (!activeStudent && ["#angaben", "#anmeldung", "#unterlagen", "#aktionen"].includes(window.location.hash)) {
    window.location.hash = "schuelerbereich";
  }
}

function renderAuth(message = "") {
  const activeStudent = getActiveStudent();
  renderStudentVisibility();

  if (!activeStudent) {
    authStatus.innerHTML = `
      <strong>Nicht angemeldet</strong>
      <p>Lege einen Zugang an oder melde dich mit deiner Schul-E-Mail und PIN an. Danach werden Name, Klasse und E-Mail in die Vormerkung übernommen.</p>
      ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
    `;
    renderDocuments();
    renderProfile();
    return;
  }

  authStatus.innerHTML = `
    <strong>Angemeldet</strong>
    <p>${escapeHtml(activeStudent.name)}<br>${escapeHtml(activeStudent.className)} | ${escapeHtml(activeStudent.email)}</p>
    <a class="button primary" href="#angaben">Meine Angaben</a>
    <a class="button primary" href="#unterlagen">Unterlagen hochladen</a>
    <a class="button primary" href="intern.html">Interner Bereich</a>
    <a class="button primary" href="#anmeldung">Zur Vormerkung</a>
    <button class="button compact" type="button" id="logoutButton">Abmelden</button>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;
  prefillSignup(activeStudent);
  renderDocuments();
  renderProfile();
}

function renderProfile(message = "") {
  const activeStudent = getActiveStudent();
  const fields = [...studentProfileForm.elements].filter(field => field.name);

  fields.forEach(field => {
    field.disabled = !activeStudent;
  });

  studentProfileForm.querySelector("button").disabled = !activeStudent;

  if (!activeStudent) {
    profileMessage.textContent = "Bitte zuerst anmelden, damit die Angaben gespeichert werden können.";
    return;
  }

  const profile = getActiveStudentProfile();
  fields.forEach(field => {
    field.value = profile?.[field.name] || "";
  });
  profileMessage.textContent = message;
}

function renderDocuments(message = "") {
  const activeStudent = getActiveStudent();
  const fieldsDisabled = !activeStudent;
  const documents = getActiveStudentDocuments();

  documentUploadForm.querySelector("button").disabled = fieldsDisabled;
  documentUploadForm.elements.consentImage.disabled = fieldsDisabled;
  saveSignature.disabled = fieldsDisabled;
  clearSignature.disabled = fieldsDisabled;

  if (!activeStudent) {
    documentPreview.innerHTML = "<p class=\"empty\">Bitte zuerst anmelden, damit die Unterlagen einem Schülerzugang zugeordnet werden können.</p>";
    signaturePreview.innerHTML = "";
    return;
  }

  documentPreview.innerHTML = documents?.consentImage ? `
    <img src="${documents.consentImage}" alt="Hochgeladene Einverständniserklärung">
    <a class="button compact" href="${documents.consentImage}" target="_blank" rel="noopener">Bild öffnen</a>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  ` : `
    <p class="empty">Noch kein Bild gespeichert.</p>
    ${message ? `<p class="auth-message">${escapeHtml(message)}</p>` : ""}
  `;

  signaturePreview.innerHTML = documents?.signature ? `
    <strong>Gespeicherte Unterschrift</strong>
    <img src="${documents.signature}" alt="Gespeicherte digitale Unterschrift">
  ` : "<p class=\"empty\">Noch keine Unterschrift gespeichert.</p>";
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", reject);
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("error", reject);
      image.addEventListener("load", () => {
        const maxWidth = 1400;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .86));
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function setupSignaturePad() {
  const context = signaturePad.getContext("2d");
  let drawing = false;

  context.lineWidth = 3;
  context.lineCap = "round";
  context.strokeStyle = "#17211f";

  function pointFromEvent(event) {
    const rect = signaturePad.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (signaturePad.width / rect.width),
      y: (event.clientY - rect.top) * (signaturePad.height / rect.height)
    };
  }

  signaturePad.addEventListener("pointerdown", event => {
    if (!getActiveStudent()) return;
    drawing = true;
    signaturePad.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });

  signaturePad.addEventListener("pointermove", event => {
    if (!drawing) return;
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });

  signaturePad.addEventListener("pointerup", () => {
    drawing = false;
  });

  signaturePad.addEventListener("pointercancel", () => {
    drawing = false;
  });
}

registerForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const email = normalizeEmail(data.get("studentEmail"));

  try {
    const result = await apiRequest("/api/students/register", {
      method: "POST",
      body: JSON.stringify({
        name: String(data.get("studentName") || "").trim(),
        className: String(data.get("studentClass") || "").trim(),
        email,
        pin: String(data.get("studentPin") || "")
      })
    });

    setActiveStudent(result.student, result.token);
    await loadRemoteStudentData();
    registerForm.reset();
    renderAuth("Zugang angelegt. Du bist jetzt angemeldet.");
    showStudentArea("angaben");
  } catch (error) {
    renderAuth(error.message);
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = normalizeEmail(data.get("loginEmail"));
  const pin = String(data.get("loginPin") || "");

  try {
    const result = await apiRequest("/api/students/login", {
      method: "POST",
      body: JSON.stringify({ email, pin })
    });

    setActiveStudent(result.student, result.token);
    await loadRemoteStudentData();
    loginForm.reset();
    renderAuth("Erfolgreich angemeldet.");
    showStudentArea("angaben");
  } catch (error) {
    renderAuth(error.message);
  }
});

authStatus.addEventListener("click", event => {
  const button = event.target.closest("#logoutButton");
  if (!button) return;
  setActiveStudent(null);
  renderAuth("Du bist abgemeldet.");
  showStudentArea("schuelerbereich");
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(form);
  const activeStudent = getActiveStudent();

  if (!activeStudent) {
    renderAuth("Bitte zuerst einloggen.");
    return;
  }

  const signup = {
    createdAt: new Date().toISOString(),
    studentAccount: activeStudent.id,
    student: data.get("student"),
    className: data.get("className"),
    guardian: data.get("guardian"),
    email: data.get("email"),
    phone: data.get("phone"),
    trip: data.get("trip"),
    notes: data.get("notes"),
    profile: getActiveStudentProfile()
  };

  try {
    await apiRequest("/api/students/me/signups", {
      method: "POST",
      body: JSON.stringify({ signup })
    });
    form.reset();
    prefillSignup(activeStudent);
    renderAuth("Vormerkung gespeichert.");
  } catch (error) {
    renderAuth(error.message);
  }
});

studentProfileForm.addEventListener("submit", async event => {
  event.preventDefault();
  const activeStudent = getActiveStudent();
  if (!activeStudent) {
    renderProfile("Bitte zuerst anmelden.");
    return;
  }

  const data = new FormData(studentProfileForm);
  const profile = Object.fromEntries(data.entries());
  try {
    await writeActiveStudentProfile(profile);

    form.elements.guardian.value = profile.parent1Name || form.elements.guardian.value;
    form.elements.phone.value = profile.parent1Phone || form.elements.phone.value;
    form.elements.notes.value = [profile.allergies, profile.medication, profile.food, profile.supportNotes]
      .filter(Boolean)
      .join("\n");

    renderProfile("Angaben gespeichert.");
  } catch (error) {
    renderProfile(error.message);
  }
});

documentUploadForm.addEventListener("submit", async event => {
  event.preventDefault();
  const file = documentUploadForm.elements.consentImage.files[0];
  if (!file || !getActiveStudent()) {
    renderDocuments("Bitte zuerst anmelden und ein Bild auswählen.");
    return;
  }

  const imageData = await resizeImageFile(file);
  try {
    await writeActiveStudentDocuments({
      consentImage: imageData,
      consentImageName: file.name,
      consentImageUpdatedAt: new Date().toISOString()
    });
    documentUploadForm.reset();
    renderDocuments("Einverständniserklärung gespeichert.");
  } catch (error) {
    renderDocuments(error.message);
  }
});

saveSignature.addEventListener("click", async () => {
  if (!getActiveStudent()) {
    renderDocuments("Bitte zuerst anmelden.");
    return;
  }

  try {
    await writeActiveStudentDocuments({
      signature: signaturePad.toDataURL("image/png"),
      signatureUpdatedAt: new Date().toISOString()
    });
    renderDocuments("Unterschrift gespeichert.");
  } catch (error) {
    renderDocuments(error.message);
  }
});

clearSignature.addEventListener("click", async () => {
  signaturePad.getContext("2d").clearRect(0, 0, signaturePad.width, signaturePad.height);
  try {
    await writeActiveStudentDocuments({
      signature: "",
      signatureUpdatedAt: new Date().toISOString()
    });
    renderDocuments("Unterschrift gelöscht.");
  } catch (error) {
    renderDocuments(error.message);
  }
});

setupSignaturePad();
renderAuth();
