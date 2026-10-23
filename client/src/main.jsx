import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import axios from "axios";
import "./styles.css";

const api = axios.create({ baseURL: "/api" });
const demoAccounts = { student: "student@college.edu", faculty: "faculty@college.edu", administrator: "admin@college.edu" };
const roles = { student: { label: "Student", theme: "student", icon: BookOpen }, faculty: { label: "Faculty", theme: "faculty", icon: Users }, administrator: { label: "Administrator", theme: "admin", icon: ShieldCheck } };

function App() {
  const [token, setToken] = useState(localStorage.getItem("campuspulse_token"));
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get("/me", { headers: { Authorization: `Bearer ${token}` } }).then(({ data }) => setUser(data.user)).catch(() => { localStorage.removeItem("campuspulse_token"); setToken(null); });
  }, [token]);

  async function login(event) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.post("/auth/login", { email: form.get("email"), password: form.get("password") });
      localStorage.setItem("campuspulse_token", data.token); setToken(data.token); setUser(data.user);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to sign in."); }
    finally { setLoading(false); }
  }

  if (!user) return <Login selectedRole={selectedRole} setSelectedRole={setSelectedRole} login={login} error={error} loading={loading} />;
  return <Dashboard user={user} token={token} onLogout={() => { localStorage.removeItem("campuspulse_token"); setToken(null); setUser(null); }} />;
}

function Login({ selectedRole, setSelectedRole, login, error, loading }) {
  return <main className={`login-shell ${roles[selectedRole].theme}`}>
    <section className="login-intro"><div className="brand-mark"><Sparkles size={20} /> CampusPulse</div><div className="intro-copy"><p className="eyebrow">ONE CAMPUS. EVERY IMPORTANT MOMENT.</p><h1>Stay ahead of<br /><em>campus life.</em></h1><p className="intro-description">The intelligent command center for notices, deadlines, exams, and everything that keeps your academic journey moving.</p></div><div className="intro-footer"><span><CheckCircle2 size={16} /> Trusted campus updates</span><span><ShieldCheck size={16} /> Secure by design</span></div></section>
    <section className="login-panel"><div className="mobile-brand"><Sparkles size={19} /> CampusPulse</div><div className="panel-header"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your portal</h2><p>Select your role to continue to the right workspace.</p></div><div className="role-picker">{Object.entries(roles).map(([key, value]) => { const Icon = value.icon; return <button type="button" className={selectedRole === key ? "role-card active" : "role-card"} onClick={() => setSelectedRole(key)} key={key}><Icon size={19} /><span>{value.label}</span><ChevronRight size={15} /></button>; })}</div><form onSubmit={login} className="login-form"><label>Institutional email<input name="email" type="email" defaultValue={demoAccounts[selectedRole]} required /></label><label>Password<input name="password" type="password" defaultValue={`${selectedRole}123`} minLength="6" required /></label>{error && <div className="error-message">{error}</div>}<button className="primary-button" disabled={loading}>{loading ? "Signing in..." : `Continue as ${roles[selectedRole].label}`} <ChevronRight size={17} /></button></form><p className="demo-hint">Demo access is pre-filled. Student: student123 · Faculty: faculty123 · Admin: admin123</p></section>
  </main>;
}

function Dashboard({ user, token, onLogout }) {
  const role = roles[user.role]; const [data, setData] = useState(null); const [active, setActive] = useState("Overview"); const [search, setSearch] = useState(""); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { api.get("/dashboard", { headers: { Authorization: `Bearer ${token}` } }).then(({ data: result }) => setData(result)); }, [token]);
  const nav = user.role === "student" ? ["Overview", "Notices", "My deadlines", "Examinations", "Academic calendar", "AI assistant"] : user.role === "faculty" ? ["Overview", "Publish notice", "My classes", "Submissions", "Calendar"] : ["Overview", "Notice approvals", "Users & roles", "Analytics", "System settings"];
  const filteredNotices = useMemo(() => data?.notices.filter((notice) => `${notice.title} ${notice.summary}`.toLowerCase().includes(search.toLowerCase())) || [], [data, search]);
  if (!data) return <div className="loading-screen"><Sparkles /> Loading your workspace...</div>;
  return <main className={`app-shell ${role.theme}`}><aside className={mobileOpen ? "sidebar open" : "sidebar"}><div className="sidebar-brand"><span className="logo-tile"><Sparkles size={18} /></span><span>CampusPulse</span><button className="close-nav" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><div className="portal-tag">{role.label} portal</div><nav>{nav.map((item, index) => <button className={active === item ? "nav-item active" : "nav-item"} onClick={() => { setActive(item); setMobileOpen(false); }} key={item}>{index === 0 ? <LayoutDashboard size={18} /> : item.includes("deadline") || item.includes("Calendar") ? <CalendarDays size={18} /> : item.includes("notice") || item.includes("Notice") ? <FileText size={18} /> : item.includes("assistant") ? <Sparkles size={18} /> : <BookOpen size={18} />}{item}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item"><Bell size={18} />Notifications <span className="nav-badge">3</span></button><button className="nav-item" onClick={onLogout}><LogOut size={18} />Sign out</button></div></aside><section className="content"><header className="topbar"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu /></button><div className="breadcrumb"><span>{role.label} portal</span><ChevronRight size={15} /><strong>{active}</strong></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar">{user.name.split(" ").map((part) => part[0]).join("")}</div></div></header><div className="page"><div className="page-heading"><div><p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</p><h1>{active === "Overview" ? `Good morning, ${user.name.split(" ")[0]}.` : active}</h1><p className="muted">{user.role === "student" ? "Here is what deserves your attention today." : "Keep your campus operations moving forward."}</p></div><div className="search-box"><Search size={17} /><input placeholder="Search notices..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><Overview user={user} data={{ ...data, notices: filteredNotices }} /></div></section></main>;
}

function Overview({ user, data }) {
  const isStudent = user.role === "student";
  const cards = isStudent ? [["Unread notices", data.stats.unreadNotices, "Needs your attention", Bell], ["Pending assignments", data.stats.pendingAssignments, "Keep your momentum", FileText], ["Upcoming deadlines", data.stats.upcomingDeadlines, "Across your courses", Clock3], ["Examinations", data.stats.upcomingExams, "Next 30 days", CalendarDays]] : [["Published notices", data.stats.publishedNotices, "This semester", FileText], ["Pending approvals", data.stats.pendingApprovals, "Awaiting review", Clock3], ["Active students", data.stats.activeStudents, "Across departments", Users], ["Upcoming events", data.stats.upcomingEvents, "This month", CalendarDays]];
  return <><div className="stats-grid">{cards.map(([label, value, detail, Icon]) => <article className="stat-card" key={label}><div className="stat-icon"><Icon size={18} /></div><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>)}</div><div className="dashboard-grid"><section className="panel notice-panel"><div className="panel-title"><div><p className="eyebrow">LATEST UPDATES</p><h2>Recent notices</h2></div><button className="text-button">View all <ChevronRight size={15} /></button></div>{data.notices.map((notice) => <article className="notice-row" key={notice.id}><div className={`priority ${notice.priority.toLowerCase()}`} /><div className="notice-content"><div className="notice-meta"><span>{notice.category}</span><span>·</span><span>{notice.publishedAt}</span></div><h3>{notice.title}</h3><p>{notice.summary}</p></div><ChevronRight className="row-chevron" size={18} /></article>)}</section>{isStudent ? <section className="panel"><div className="panel-title"><div><p className="eyebrow">YOUR WEEK</p><h2>Upcoming deadlines</h2></div><button className="text-button">Calendar <ChevronRight size={15} /></button></div><div className="deadline-list">{data.deadlines.map((item) => <div className="deadline-row" key={item.id}><div className="date-block"><strong>{new Date(item.due).getDate()}</strong><span>{new Date(item.due).toLocaleDateString("en-US", { month: "short" })}</span></div><div><h3>{item.title}</h3><p>{item.course} · {item.status}</p></div><span className="deadline-type">{item.type}</span></div>)}</div></section> : <section className="panel activity-panel"><div className="panel-title"><div><p className="eyebrow">SYSTEM PULSE</p><h2>Recent activity</h2></div></div>{["Notice approval queue reviewed", "12 student accounts provisioned", "Weekly digest scheduled"].map((activity, index) => <div className="activity-row" key={activity}><span className="activity-dot" /><div><strong>{activity}</strong><p>{index + 1} hour{index ? "s" : ""} ago</p></div></div>)}</section>}</div></>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
