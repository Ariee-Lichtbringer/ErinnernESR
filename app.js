const signupStorageKey = "erinnern-esr-signups";
const studentStorageKey = "erinnern-esr-students";
const sessionStorageKey = "erinnern-esr-active-student";
const documentStorageKey = "erinnern-esr-student-documents";

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

function readDocuments() {
  return readJson(documentStorageKey, {});
}

function writeDocuments(documents) {
  writeJson(documentStorageKey, documents);
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

function getActiveStudentDocuments() {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return null;
  return readDocuments()[activeStudent.id] || {};
}

function writeActiveStudentDocuments(update) {
  const activeStudent = getActiveStudent();
  if (!activeStudent) return false;
  const documents = readDocuments();
  documents[activeStudent.id] = {
    ...(documents[activeStudent.id] || {}),
    ...update
  };
  writeDocuments(documents);
  return true;
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
    renderDocuments();
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
  renderDocuments();
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

documentUploadForm.addEventListener("submit", async event => {
  event.preventDefault();
  const file = documentUploadForm.elements.consentImage.files[0];
  if (!file || !getActiveStudent()) {
    renderDocuments("Bitte zuerst anmelden und ein Bild auswählen.");
    return;
  }

  const imageData = await resizeImageFile(file);
  writeActiveStudentDocuments({
    consentImage: imageData,
    consentImageName: file.name,
    consentImageUpdatedAt: new Date().toISOString()
  });
  documentUploadForm.reset();
  renderDocuments("Einverständniserklärung gespeichert.");
});

saveSignature.addEventListener("click", () => {
  if (!getActiveStudent()) {
    renderDocuments("Bitte zuerst anmelden.");
    return;
  }

  writeActiveStudentDocuments({
    signature: signaturePad.toDataURL("image/png"),
    signatureUpdatedAt: new Date().toISOString()
  });
  renderDocuments("Unterschrift gespeichert.");
});

clearSignature.addEventListener("click", () => {
  signaturePad.getContext("2d").clearRect(0, 0, signaturePad.width, signaturePad.height);
  writeActiveStudentDocuments({
    signature: "",
    signatureUpdatedAt: new Date().toISOString()
  });
  renderDocuments("Unterschrift gelöscht.");
});

setupSignaturePad();
renderAuth();
