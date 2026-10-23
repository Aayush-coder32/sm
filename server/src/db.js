import { MongoClient } from "mongodb";
import { users, notices, deadlines, exams } from "./data.js";

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
    database.collection("deadlines").createIndex({ id: 1 }, { unique: true })
  ]);
  await seedCollection(database, "users", users);
  await seedCollection(database, "notices", notices);
  await seedCollection(database, "deadlines", deadlines);
  await seedCollection(database, "exams", exams);
  return database;
}

async function seedCollection(database, collectionName, documents) {
  const collection = database.collection(collectionName);
  if (await collection.estimatedDocumentCount() === 0) await collection.insertMany(documents);
}

export async function closeDatabase() {
  await client.close();
  databasePromise = undefined;
}
