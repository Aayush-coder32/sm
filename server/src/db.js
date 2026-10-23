import { MongoClient } from "mongodb";

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
  return database;
}

export async function closeDatabase() {
  await client.close();
  databasePromise = undefined;
}
