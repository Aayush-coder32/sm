import "dotenv/config";
import dns from "node:dns/promises";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDatabase, closeDatabase } from "./db.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "development-only-secret";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  department: z.string().trim().min(2).max(80).default("General")
});

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required." });
  try {
    req.user = jwt.verify(authorization.slice(7), jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "You do not have permission to access this resource." });
    next();
  };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "smart-college-assistant-api" }));

app.post("/api/auth/login", async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
  try {
    const database = await getDatabase();
    const user = await database.collection("users").findOne({ email: parsed.data.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) return res.status(401).json({ message: "Invalid credentials." });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: "2h" });
    res.json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post("/api/auth/register", async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a name, valid email, and password of at least 6 characters." });
  try {
    const database = await getDatabase();
    const email = parsed.data.email.toLowerCase();
    const existingUser = await database.collection("users").findOne({ email });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });
    const user = {
      id: `user-${Date.now()}`,
      name: parsed.data.name,
      email,
      password: await bcrypt.hash(parsed.data.password, 12),
      role: "student",
      department: parsed.data.department,
      semester: "1st"
    };
    await database.collection("users").insertOne(user);
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: "2h" });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get("/api/me", requireAuth, async (req, res, next) => {
  try {
    const user = await (await getDatabase()).collection("users").findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get("/api/dashboard", requireAuth, async (req, res, next) => {
  try {
    const database = await getDatabase();
    const [user, notices, deadlines, exams] = await Promise.all([
      database.collection("users").findOne({ id: req.user.id }),
      database.collection("notices").find().sort({ publishedAt: -1 }).toArray(),
      database.collection("deadlines").find().sort({ due: 1 }).toArray(),
      database.collection("exams").find().sort({ date: 1 }).toArray()
    ]);
    if (!user) return res.status(404).json({ message: "User not found." });
    const isStudent = user.role === "student";
    res.json({
      user: publicUser(user),
      stats: isStudent
        ? { unreadNotices: notices.filter((notice) => notice.status === "Unread").length, pendingAssignments: deadlines.filter((item) => item.type === "Assignment" && item.status !== "Complete").length, upcomingDeadlines: deadlines.length, upcomingExams: exams.length }
        : { publishedNotices: notices.length, pendingApprovals: 7, activeStudents: 1248, upcomingEvents: 12 },
      notices: user.role === "administrator" ? notices : notices.filter((notice) => notice.audience === "All students" || notice.audience === user.department),
      deadlines: isStudent ? deadlines : [],
      exams: isStudent ? exams : []
    });
  } catch (error) { next(error); }
});

app.get("/api/notices", requireAuth, async (req, res, next) => {
  const query = String(req.query.search || "").toLowerCase();
  const category = String(req.query.category || "All");
  try {
    const notices = await (await getDatabase()).collection("notices").find().sort({ publishedAt: -1 }).toArray();
    const result = notices.filter((notice) => {
      const matchesQuery = !query || `${notice.title} ${notice.summary}`.toLowerCase().includes(query);
      return matchesQuery && (category === "All" || notice.category === category);
    });
    res.json({ notices: result });
  } catch (error) { next(error); }
});

app.post("/api/notices", requireAuth, requireRole("faculty", "administrator"), async (req, res, next) => {
  const title = z.string().min(5).safeParse(req.body.title);
  if (!title.success) return res.status(400).json({ message: "A notice title is required." });
  const notice = { id: `notice-${Date.now()}`, title: title.data, category: req.body.category || "General", priority: req.body.priority || "Medium", audience: req.body.audience || "All students", publishedAt: new Date().toISOString().slice(0, 10), summary: req.body.summary || "New campus announcement.", status: "Unread" };
  try {
    await (await getDatabase()).collection("notices").insertOne(notice);
    res.status(201).json({ notice });
  } catch (error) { next(error); }
});

app.get("/api/admin/overview", requireAuth, requireRole("administrator"), async (_req, res, next) => {
  try {
    const database = await getDatabase();
    const [users, notices] = await Promise.all([
      database.collection("users").find().toArray(),
      database.collection("notices").find().sort({ publishedAt: -1 }).toArray()
    ]);
    res.json({ users: users.map(publicUser), notices, recentActivity: ["Notice approval queue reviewed", "12 student accounts provisioned", "Weekly digest scheduled"] });
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

app.use((error, _req, res, _next) => {
  console.error("API request failed:", error);
  res.status(500).json({ message: "The server could not complete the request." });
});

const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
process.once("SIGINT", async () => { await closeDatabase(); server.close(() => process.exit(0)); });
process.once("SIGTERM", async () => { await closeDatabase(); server.close(() => process.exit(0)); });
