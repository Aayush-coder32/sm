import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DB_NAME || "campuspulse";

const client = new MongoClient(uri, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000
});

let databasePromise;

export function getDatabase() {
  if (!databasePromise) databasePromise = connectAndSeed();
  return databasePromise;
}

async function connectAndSeed() {
  await client.connect();
  const database = client.db(databaseName);
  await Promise.all([
    database.collection("users").createIndex({ id: 1 }, { unique: true }),
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("notices").createIndex({ id: 1 }, { unique: true }),
    database.collection("deadlines").createIndex({ id: 1 }, { unique: true }),
    database.collection("contact_messages").createIndex({ id: 1 }, { unique: true }),
    database.collection("contact_messages").createIndex({ createdAt: -1 }),
    database.collection("classes").createIndex({ id: 1 }, { unique: true }),
    database.collection("classes").createIndex({ status: 1, department: 1 }),
    database.collection("student_profiles").createIndex({ id: 1 }, { unique: true }),
    database.collection("student_profiles").createIndex({ studentId: 1 }, { unique: true }),
    database.collection("assignments").createIndex({ id: 1 }, { unique: true }),
    database.collection("assignments").createIndex({ studentId: 1, createdAt: -1 }),
    database.collection("results").createIndex({ studentId: 1 }, { unique: true })
    ,database.collection("academic_fees").createIndex({ studentId: 1 }, { unique: true })
    ,database.collection("examination_forms").createIndex({ studentId: 1 }, { unique: true })
  ]);
  await ensureAdministrator(database);
  return database;
}

async function ensureAdministrator(database) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existingUser = await database.collection("users").findOne({ email });
  if (existingUser) return;

  await database.collection("users").insertOne({
    id: `admin-${Date.now()}`,
    name: process.env.ADMIN_NAME || "Campus Administrator",
    email,
    password: await bcrypt.hash(password, 12),
    role: "administrator",
    department: "Administration",
    semester: "N/A"
  });
}

export async function closeDatabase() {
  await client.close();
  databasePromise = undefined;
}
