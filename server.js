const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");

let Pool = null;
try {
  ({ Pool } = require("pg"));
} catch {
  Pool = null;
}

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SESSION_SECRET || "dev-secret-change-on-railway";
const dataFile = path.join(__dirname, "data", "students.json");
const pool = process.env.DATABASE_URL && Pool
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    })
  : null;

app.use(express.json({ limit: "8mb" }));
app.use(express.static(__dirname));

function hashPin(pin, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(pin), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPin(pin, stored) {
  const [salt, expected] = String(stored || "").split(":");
  if (!salt || !expected) return false;
  const actual = hashPin(pin, salt).split(":")[1];
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function publicStudent(row) {
  return {
    id: row.id,
    name: row.name,
    className: row.class_name || row.className,
    email: row.email
  };
}

function signToken(studentId) {
  const payload = `${studentId}.${Date.now()}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (parts[2].length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))) return null;
  return parts[0];
}

function readStore() {
  if (!fs.existsSync(dataFile)) {
    return { students: [], profiles: {}, documents: {}, signups: [] };
  }
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

async function initDb() {
  if (!pool) return;
  await pool.query(`
    create table if not exists students (
      id text primary key,
      name text not null,
      class_name text not null,
      email text unique not null,
      pin_hash text not null,
      created_at timestamptz default now()
    );
    create table if not exists student_profiles (
      student_id text primary key references students(id) on delete cascade,
      profile jsonb not null default '{}'::jsonb,
      updated_at timestamptz default now()
    );
    create table if not exists student_documents (
      student_id text primary key references students(id) on delete cascade,
      documents jsonb not null default '{}'::jsonb,
      updated_at timestamptz default now()
    );
    create table if not exists signups (
      id text primary key,
      student_id text references students(id) on delete set null,
      payload jsonb not null,
      created_at timestamptz default now()
    );
  `);
}

async function findStudentByEmail(email) {
  if (pool) {
    const result = await pool.query("select * from students where email = $1", [email]);
    return result.rows[0] || null;
  }
  return readStore().students.find(student => student.email === email) || null;
}

async function findStudentById(id) {
  if (pool) {
    const result = await pool.query("select * from students where id = $1", [id]);
    return result.rows[0] || null;
  }
  return readStore().students.find(student => student.id === id) || null;
}

async function requireStudent(req, res, next) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const studentId = verifyToken(token);
  if (!studentId) {
    res.status(401).json({ error: "Nicht angemeldet." });
    return;
  }
  const student = await findStudentById(studentId);
  if (!student) {
    res.status(401).json({ error: "Schülerkonto nicht gefunden." });
    return;
  }
  req.student = student;
  next();
}

app.post("/api/students/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const className = String(req.body.className || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const pin = String(req.body.pin || "");

  if (!name || !className || !email || pin.length < 4) {
    res.status(400).json({ error: "Bitte alle Felder vollständig ausfüllen." });
    return;
  }

  if (await findStudentByEmail(email)) {
    res.status(409).json({ error: "Für diese E-Mail gibt es bereits einen Zugang." });
    return;
  }

  const student = { id: crypto.randomUUID(), name, className, email, pin_hash: hashPin(pin) };

  if (pool) {
    await pool.query(
      "insert into students (id, name, class_name, email, pin_hash) values ($1, $2, $3, $4, $5)",
      [student.id, name, className, email, student.pin_hash]
    );
  } else {
    const store = readStore();
    store.students.push(student);
    writeStore(store);
  }

  res.json({ student: publicStudent(student), token: signToken(student.id) });
});

app.post("/api/students/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const pin = String(req.body.pin || "");
  const student = await findStudentByEmail(email);

  if (!student || !verifyPin(pin, student.pin_hash)) {
    res.status(401).json({ error: "E-Mail oder PIN stimmt nicht." });
    return;
  }

  res.json({ student: publicStudent(student), token: signToken(student.id) });
});

app.get("/api/students/me", requireStudent, (req, res) => {
  res.json({ student: publicStudent(req.student) });
});

app.get("/api/students/me/profile", requireStudent, async (req, res) => {
  if (pool) {
    const result = await pool.query("select profile from student_profiles where student_id = $1", [req.student.id]);
    res.json({ profile: result.rows[0]?.profile || {} });
    return;
  }
  res.json({ profile: readStore().profiles[req.student.id] || {} });
});

app.put("/api/students/me/profile", requireStudent, async (req, res) => {
  const profile = req.body.profile || {};
  if (pool) {
    await pool.query(
      `insert into student_profiles (student_id, profile, updated_at)
       values ($1, $2, now())
       on conflict (student_id) do update set profile = excluded.profile, updated_at = now()`,
      [req.student.id, profile]
    );
  } else {
    const store = readStore();
    store.profiles[req.student.id] = profile;
    writeStore(store);
  }
  res.json({ profile });
});

app.get("/api/students/me/documents", requireStudent, async (req, res) => {
  if (pool) {
    const result = await pool.query("select documents from student_documents where student_id = $1", [req.student.id]);
    res.json({ documents: result.rows[0]?.documents || {} });
    return;
  }
  res.json({ documents: readStore().documents[req.student.id] || {} });
});

app.put("/api/students/me/documents", requireStudent, async (req, res) => {
  const documents = req.body.documents || {};
  if (pool) {
    await pool.query(
      `insert into student_documents (student_id, documents, updated_at)
       values ($1, $2, now())
       on conflict (student_id) do update set documents = excluded.documents, updated_at = now()`,
      [req.student.id, documents]
    );
  } else {
    const store = readStore();
    store.documents[req.student.id] = documents;
    writeStore(store);
  }
  res.json({ documents });
});

app.post("/api/students/me/signups", requireStudent, async (req, res) => {
  const payload = req.body.signup || {};
  const id = crypto.randomUUID();
  if (pool) {
    await pool.query(
      "insert into signups (id, student_id, payload) values ($1, $2, $3)",
      [id, req.student.id, payload]
    );
  } else {
    const store = readStore();
    store.signups.push({ id, student_id: req.student.id, payload, created_at: new Date().toISOString() });
    writeStore(store);
  }
  res.json({ id });
});

app.get("/api/teacher/students", async (req, res) => {
  const teacherPin = process.env.TEACHER_PIN;
  const providedPin = String(req.headers["x-teacher-pin"] || "");

  if (!teacherPin) {
    res.status(503).json({ error: "TEACHER_PIN ist auf Railway noch nicht gesetzt." });
    return;
  }

  if (!providedPin || providedPin !== teacherPin) {
    res.status(401).json({ error: "Lehrer-PIN stimmt nicht." });
    return;
  }

  if (pool) {
    const result = await pool.query(`
      select
        s.id,
        s.name,
        s.class_name,
        s.email,
        coalesce(p.profile, '{}'::jsonb) as profile,
        coalesce(d.documents, '{}'::jsonb) as documents
      from students s
      left join student_profiles p on p.student_id = s.id
      left join student_documents d on d.student_id = s.id
      order by s.class_name, s.name
    `);
    res.json({ students: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      className: row.class_name,
      email: row.email,
      profile: row.profile,
      documents: row.documents
    })) });
    return;
  }

  const store = readStore();
  res.json({
    students: store.students.map(student => ({
      id: student.id,
      name: student.name,
      className: student.className,
      email: student.email,
      profile: store.profiles[student.id] || {},
      documents: store.documents[student.id] || {}
    }))
  });
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Erinnern ESR läuft auf Port ${port}`);
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
