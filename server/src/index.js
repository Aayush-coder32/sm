import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { users, notices, deadlines, exams } from "./data.js";

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "development-only-secret";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
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

app.post("/api/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
  const user = users.find((candidate) => candidate.email === parsed.data.email.toLowerCase() && candidate.password === parsed.data.password);
  if (!user) return res.status(401).json({ message: "Invalid credentials." });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: "2h" });
  res.json({ token, user: publicUser(user) });
});

app.get("/api/me", requireAuth, (req, res) => {
  const user = users.find((candidate) => candidate.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: publicUser(user) });
});

app.get("/api/dashboard", requireAuth, (req, res) => {
  const user = users.find((candidate) => candidate.id === req.user.id);
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
});

app.get("/api/notices", requireAuth, (req, res) => {
  const query = String(req.query.search || "").toLowerCase();
  const category = String(req.query.category || "All");
  const result = notices.filter((notice) => {
    const matchesQuery = !query || `${notice.title} ${notice.summary}`.toLowerCase().includes(query);
    return matchesQuery && (category === "All" || notice.category === category);
  });
  res.json({ notices: result });
});

app.post("/api/notices", requireAuth, requireRole("faculty", "administrator"), (req, res) => {
  const title = z.string().min(5).safeParse(req.body.title);
  if (!title.success) return res.status(400).json({ message: "A notice title is required." });
  const notice = { id: `notice-${Date.now()}`, title: title.data, category: req.body.category || "General", priority: req.body.priority || "Medium", audience: req.body.audience || "All students", publishedAt: new Date().toISOString().slice(0, 10), summary: req.body.summary || "New campus announcement.", status: "Unread" };
  notices.unshift(notice);
  res.status(201).json({ notice });
});

app.get("/api/admin/overview", requireAuth, requireRole("administrator"), (_req, res) => {
  res.json({ users: users.map(publicUser), notices, recentActivity: ["Notice approval queue reviewed", "12 student accounts provisioned", "Weekly digest scheduled"] });
});

app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
