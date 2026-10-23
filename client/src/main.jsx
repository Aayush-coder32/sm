import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Clock3, FileText, LayoutDashboard, LogOut, Mail, Menu, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import axios from "axios";
import "./styles.css";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "/api" });
const roles = { student: { label: "Student", theme: "student", icon: BookOpen }, faculty: { label: "Faculty", theme: "faculty", icon: Users }, administrator: { label: "Administrator", theme: "admin", icon: ShieldCheck } };

function App() {
  const [token, setToken] = useState(localStorage.getItem("campuspulse_token"));
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
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

  async function register(event) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.post("/auth/register", { name: form.get("name"), email: form.get("email"), password: form.get("password"), department: form.get("department"), role: selectedRole });
      localStorage.setItem("campuspulse_token", data.token); setToken(data.token); setUser(data.user);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to create account."); }
    finally { setLoading(false); }
  }

  if (!user && !showLogin) return <Landing onGetStarted={() => setShowLogin(true)} />;
  if (!user) return <Login selectedRole={selectedRole} setSelectedRole={setSelectedRole} login={login} register={register} error={error} loading={loading} onBack={() => setShowLogin(false)} />;
  return <Dashboard user={user} token={token} onLogout={() => { localStorage.removeItem("campuspulse_token"); setToken(null); setUser(null); }} />;
}

function Landing({ onGetStarted }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  return <main className="landing-page">
    <div className="announcement-bar"><span className="announcement-dot" /> <strong>New</strong> AI-powered campus intelligence is here <a href="#features">See what's new <ArrowRight size={13} /></a></div>
    <nav className={scrolled ? "landing-nav is-scrolled" : "landing-nav"}>
      <a href="#" className="landing-brand" onClick={closeMobileNav}><span className="logo-tile"><Sparkles size={18} /></span><span>CampusPulse</span></a>
      <div className={mobileNavOpen ? "landing-links mobile-open" : "landing-links"}>
        <div className="nav-dropdown"><button type="button" className="nav-link">Platform <ChevronDown size={13} /></button><div className="nav-menu"><a href="#features" onClick={closeMobileNav}><span className="nav-menu-icon blue"><Bell size={15} /></span><span><b>Smart notices</b><small>Important updates, prioritized</small></span></a><a href="#features" onClick={closeMobileNav}><span className="nav-menu-icon green"><CalendarDays size={15} /></span><span><b>Academic planning</b><small>Deadlines and exams in one view</small></span></a><a href="#features" onClick={closeMobileNav}><span className="nav-menu-icon purple"><Sparkles size={15} /></span><span><b>AI assistant</b><small>Turn information into action</small></span></a></div></div>
        <a href="#gallery" onClick={closeMobileNav}>Gallery</a>
        <a href="#features" onClick={closeMobileNav}>How it works</a>
        <a href="#about" onClick={closeMobileNav}>About</a>
        <a href="#contact" onClick={closeMobileNav}>Contact</a>
        <button className="mobile-nav-cta" onClick={() => { closeMobileNav(); onGetStarted(); }}>Open your portal <ArrowRight size={15} /></button>
      </div>
      <div className="landing-nav-actions"><button className="landing-login" onClick={onGetStarted}>Sign in</button><button className="landing-get-started" onClick={onGetStarted}>Get started <ArrowRight size={15} /></button><button type="button" aria-label={mobileNavOpen ? "Close menu" : "Open menu"} className="landing-menu-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </nav>
    <div className="campus-banner"><img src="/1662438602201912171000417929Hostel.webp" alt="College hostel and campus" /></div>
    <section className="landing-hero">
      <div className="hero-copy"><div className="hero-pill"><span /> THE SMARTER CAMPUS WORKSPACE</div><h1>Every notice.<br /><span>Right on time.</span></h1><p>CampusPulse brings notices, deadlines, examinations, and campus life into one intelligent workspace built for your entire college community.</p><div className="hero-actions"><button className="hero-button" onClick={onGetStarted}>Explore your portal <ArrowRight size={17} /></button><a href="#features" className="hero-secondary">See how it works <ChevronRight size={16} /></a></div><div className="hero-trust"><div className="avatar-stack"><span>AM</span><span>PS</span><span>NR</span><span>+</span></div><div><strong>Trusted by campus teams</strong><small>Stay informed. Stay ahead.</small></div></div></div>
      <div className="hero-visual"><div className="dashboard-preview image-preview campus-image-preview"><img src="/main-campus-aerial-rdl55jmercn2aqbonx5yez3qlhqvuv6h6xdm83zxig.jpg" alt="Aerial view of a modern campus" /></div></div>
    </section>
    <section className="landing-strip"><span>BUILT FOR THE WHOLE CAMPUS</span><div><b><BookOpen size={17} /> Students</b><b><Users size={17} /> Faculty</b><b><ShieldCheck size={17} /> Administrators</b></div></section>
    <section id="features" className="feature-section"><div className="section-heading"><p className="eyebrow">ONE PLACE FOR EVERYTHING</p><h2>Less searching.<br /><span>More doing.</span></h2><p>Designed around the rhythm of campus life, CampusPulse makes important information easy to find, understand, and act on.</p></div><div className="feature-grid"><article><div className="feature-image"><img src="/OIP.jpg" alt="Students receiving a smart campus notice" /><span className="feature-icon blue"><Bell size={19} /></span></div><div className="feature-card-copy"><h3>Never miss a notice</h3><p>Relevant announcements reach the right people, with smart priority and read tracking.</p></div></article><article><div className="feature-image"><img src="/OIP%20(1).jpg" alt="AI-powered academic planning workspace" /><span className="feature-icon green"><CalendarDays size={19} /></span></div><div className="feature-card-copy"><h3>Deadlines, under control</h3><p>Keep assignments, examinations, and academic milestones visible in one calm view.</p></div></article><article><div className="feature-image"><img src="/OIP%20(1).jpg" alt="Intelligent AI assistant for campus life" /><span className="feature-icon purple"><Sparkles size={19} /></span></div><div className="feature-card-copy"><h3>Intelligence built in</h3><p>Turn long notices into clear action points with your AI-powered campus assistant.</p></div></article></div></section>
    <section id="gallery" className="gallery-section"><div className="gallery-heading"><div><p className="eyebrow">LIFE ON CAMPUS</p><h2>Gallery of <span>college.</span></h2></div><p>Explore the spaces, people, and moments that make our campus feel like home.</p></div><div className="gallery-grid"><figure className="gallery-card gallery-card-large"><img src="/I_201906041051132632.jpg" alt="College campus building" /><figcaption><strong>Campus life</strong><span>Learn, connect, grow</span></figcaption></figure><figure className="gallery-card"><img src="/1662438602201912171000417929Hostel.webp" alt="College hostel building" /><figcaption><strong>Student living</strong><span>A place to belong</span></figcaption></figure><figure className="gallery-card"><img src="/rajiv-gandhi-institute-of-petroleum-technology-rae-bareli-255545.webp" alt="Rajiv Gandhi Institute campus" /><figcaption><strong>Our institute</strong><span>Built for discovery</span></figcaption></figure><figure className="gallery-card gallery-card-wide"><img src="/rgipt.jpg" alt="RGIPT college campus" /><figcaption><strong>Everyday inspiration</strong><span>Where bright futures begin</span></figcaption></figure></div></section>
    <section id="about" className="about-section"><div className="about-copy"><p className="eyebrow">ABOUT CAMPUSPULSE</p><h2>Technology that keeps campus life <span>in sync.</span></h2><p>CampusPulse brings students, faculty, and administrators into one clear, connected workspace. From the first notice of the day to the last deadline of the semester, important information stays easy to find and act on.</p><div className="about-points"><div><strong>01</strong><span>One calm view for every campus moment.</span></div><div><strong>02</strong><span>Purpose-built experiences for every role.</span></div></div></div><div className="about-card"><span className="about-card-icon"><Sparkles size={21} /></span><strong>Built for better campus days.</strong><p>Less searching. More clarity. More time for what matters.</p><div className="about-stat-row"><span><b>3</b> portals</span><span><b>1</b> shared workspace</span></div></div></section>
    <ContactSection />
    <footer className="landing-footer"><div className="footer-main"><div className="footer-brand-column"><div className="landing-brand"><span className="logo-tile"><Sparkles size={18} /></span> CampusPulse</div><p>Make every campus moment<br />clearer, calmer, and connected.</p><div className="footer-socials"><a href="#about" aria-label="CampusPulse on LinkedIn">in</a><a href="#about" aria-label="CampusPulse on Instagram">ig</a><a href="#about" aria-label="CampusPulse on X">x</a></div></div><div className="footer-links"><div><h3>Product</h3><a href="#features">Features</a><a href="#gallery">Gallery</a><a href="#about">About</a></div><div><h3>Resources</h3><a href="#features">How it works</a><a href="#about">Help center</a><a href="#contact">Contact us</a></div><div><h3>For campuses</h3><a href="#gallery">Campus life</a><a href="#gallery">Student living</a><a href="#gallery">Our institute</a></div></div><div className="footer-status"><span className="status-pulse" /> <div><strong>All systems operational</strong><small>CampusPulse is ready when you are.</small></div></div></div><div className="footer-bottom"><span>© 2026 CampusPulse. Smarter campus communication.</span><div><a href="#about">Privacy</a><a href="#about">Terms</a><span>Made for better campus days <span className="footer-heart">♥</span></span></div></div></footer>
  </main>;
}

function ContactSection() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  async function submitContact(event) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.post("/contact", {
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        message: form.get("message")
      });
      event.currentTarget.reset();
      setFeedback({ type: "success", text: data.message });
    } catch (error) {
      setFeedback({ type: "error", text: error.response?.data?.message || "We could not send your message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return <section id="contact" className="contact-section"><div className="contact-intro"><p className="eyebrow">LET'S CONNECT</p><h2>Have a question?<br /><span>We are here.</span></h2><p>Whether you are a student, faculty member, or campus leader, our team would love to hear from you.</p><div className="contact-details"><span><Mail size={16} /> hello@campuspulse.edu</span><span><Clock3 size={16} /> Mon–Fri · 9:00 AM–6:00 PM</span></div></div><form className="contact-form" onSubmit={submitContact}><div className="contact-form-heading"><strong>Send us a message</strong><span>We usually reply within one working day.</span></div><div className="contact-fields"><label>Name<input name="name" type="text" placeholder="Your name" minLength="2" maxLength="80" required /></label><label>Email<input name="email" type="email" placeholder="you@college.edu" required /></label></div><label>Subject<input name="subject" type="text" placeholder="How can we help?" minLength="3" maxLength="120" required /></label><label>Message<textarea name="message" placeholder="Tell us a little more..." minLength="10" maxLength="2000" required /></label>{feedback.text && <div className={`contact-feedback ${feedback.type}`}>{feedback.text}</div>}<button className="hero-button contact-submit" disabled={submitting}>{submitting ? "Sending..." : "Send message"} <ArrowRight size={16} /></button></form></section>;
}

function Login({ selectedRole, setSelectedRole, login, register, error, loading, onBack }) {
  const [mode, setMode] = useState("login");
  const isRegistering = mode === "register";
  return <main className={`login-shell ${roles[selectedRole].theme}`}>
    <section className="login-intro"><button className="back-home" onClick={onBack}>← Back to home</button><div className="brand-mark"><Sparkles size={20} /> CampusPulse</div><div className="intro-copy"><p className="eyebrow">ONE CAMPUS. EVERY IMPORTANT MOMENT.</p><h1>Stay ahead of<br /><em>campus life.</em></h1><p className="intro-description">The intelligent command center for notices, deadlines, exams, and everything that keeps your academic journey moving.</p></div><div className="intro-footer"><span><CheckCircle2 size={16} /> Trusted campus updates</span><span><ShieldCheck size={16} /> Secure by design</span></div></section>
    <section className="login-panel"><div className="mobile-brand"><Sparkles size={19} /> CampusPulse</div><div className="panel-header"><p className="eyebrow">{isRegistering ? "JOIN CAMPUSPULSE" : "WELCOME BACK"}</p><h2>{isRegistering ? "Create your account" : "Sign in to your portal"}</h2><p>{isRegistering ? `Create a ${roles[selectedRole].label.toLowerCase()} account to access your campus workspace.` : "Select your role to continue to the right workspace."}</p></div><div className="role-picker">{Object.entries(roles).map(([key, value]) => { const Icon = value.icon; const isAdministrator = key === "administrator"; return <button type="button" className={`${selectedRole === key ? "role-card active" : "role-card"} ${isRegistering && isAdministrator ? "role-card-locked" : ""}`} onClick={() => !isRegistering || !isAdministrator ? setSelectedRole(key) : undefined} key={key} disabled={isRegistering && isAdministrator}><Icon size={19} /><span>{value.label}</span>{isRegistering && isAdministrator ? <small>Admin only</small> : <ChevronRight size={15} />}</button>; })}</div><form onSubmit={isRegistering ? register : login} className="login-form" autoComplete="off">{isRegistering && <><label>Full name<input name="name" type="text" placeholder="Your name" autoComplete="off" required /></label><label>Department<input name="department" type="text" placeholder="e.g. Computer Science" autoComplete="off" required /></label></>}<label>Institutional email<input name="email" type="email" placeholder="you@college.edu" autoComplete="off" required /></label><label>Password<input name="password" type="password" placeholder="At least 6 characters" autoComplete="new-password" minLength="6" required /></label>{error && <div className="error-message">{error}</div>}<button className="primary-button" disabled={loading}>{loading ? (isRegistering ? "Creating account..." : "Signing in...") : (isRegistering ? `Create ${roles[selectedRole].label} account` : `Continue as ${roles[selectedRole].label}`)} <ChevronRight size={17} /></button></form><button type="button" className="auth-switch" onClick={() => { const nextIsRegistering = !isRegistering; setMode(nextIsRegistering ? "register" : "login"); if (nextIsRegistering && selectedRole === "administrator") setSelectedRole("student"); }}>{isRegistering ? "Already have an account? Sign in" : "New to CampusPulse? Create an account"}</button></section>;
  </main>;
}

function Dashboard({ user, token, onLogout }) {
  const role = roles[user.role]; const [data, setData] = useState(null); const [active, setActive] = useState("Overview"); const [search, setSearch] = useState(""); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { api.get("/dashboard", { headers: { Authorization: `Bearer ${token}` } }).then(({ data: result }) => setData(result)); }, [token]);
  const nav = user.role === "student" ? ["Overview", "Notices", "My deadlines", "Examinations", "Academic calendar", "AI assistant"] : user.role === "faculty" ? ["Overview", "Publish notice", "My classes", "Submissions", "Calendar"] : ["Overview", "Notice approvals", "Users & roles", "Analytics", "System settings"];
  const filteredNotices = useMemo(() => data?.notices.filter((notice) => `${notice.title} ${notice.summary}`.toLowerCase().includes(search.toLowerCase())) || [], [data, search]);
  if (!data) return <div className="loading-screen"><Sparkles /> Loading your workspace...</div>;
  function handlePublished(notice) {
    setData((current) => ({ ...current, notices: [notice, ...current.notices], stats: { ...current.stats, publishedNotices: (current.stats.publishedNotices || 0) + 1 } }));
    setActive("Overview");
  }
  return <main className={`app-shell ${role.theme}`}><aside className={mobileOpen ? "sidebar open" : "sidebar"}><div className="sidebar-brand"><span className="logo-tile"><Sparkles size={18} /></span><span>CampusPulse</span><button className="close-nav" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><div className="portal-tag">{role.label} portal</div><nav>{nav.map((item, index) => <button className={active === item ? "nav-item active" : "nav-item"} onClick={() => { setActive(item); setMobileOpen(false); }} key={item}>{index === 0 ? <LayoutDashboard size={18} /> : item.includes("deadline") || item.includes("Calendar") ? <CalendarDays size={18} /> : item.includes("notice") || item.includes("Notice") ? <FileText size={18} /> : item.includes("assistant") ? <Sparkles size={18} /> : <BookOpen size={18} />}{item}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item"><Bell size={18} />Notifications <span className="nav-badge">3</span></button><button className="nav-item" onClick={onLogout}><LogOut size={18} />Sign out</button></div></aside><section className="content"><header className="topbar"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu /></button><div className="breadcrumb"><span>{role.label} portal</span><ChevronRight size={15} /><strong>{active}</strong></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar">{user.name.split(" ").map((part) => part[0]).join("")}</div></div></header><div className="page"><div className="page-heading"><div><p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</p><h1>{active === "Overview" ? `Good morning, ${user.name.split(" ")[0]}.` : active}</h1><p className="muted">{user.role === "student" ? active === "Overview" ? "Here is what deserves your attention today." : pageSubtitle(active) : "Keep your campus operations moving forward."}</p></div><div className="search-box"><Search size={17} /><input placeholder="Search notices..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>{renderPage(active, user, { ...data, notices: filteredNotices }, handlePublished)}</div></section></main>;
}

function pageSubtitle(active) {
  return { Notices: "Stay informed with updates selected for your campus journey.", "My deadlines": "Plan your week with a clear view of every academic commitment.", Examinations: "Prepare early with your upcoming examination schedule.", "Academic calendar": "See the important dates shaping your semester.", "AI assistant": "Ask questions and turn campus information into your next action." }[active] || "Your campus workspace, organized around what matters.";
}

function renderPage(active, user, data, onPublished) {
  if (active === "Overview") return <Overview user={user} data={data} />;
  if (active === "Notices") return <NoticesPage notices={data.notices} />;
  if (active === "My deadlines") return <DeadlinesPage deadlines={data.deadlines} />;
  if (active === "Examinations") return <ExaminationsPage exams={data.exams} />;
  if (active === "Academic calendar") return <CalendarPage deadlines={data.deadlines} exams={data.exams} />;
  if (active === "AI assistant") return <AssistantPage />;
  if (active === "Publish notice") return <PublishNoticePage onPublished={onPublished} />;
  return <Overview user={user} data={data} />;
}

function NoticesPage({ notices }) {
  return <div className="dedicated-page notices-page"><div className="page-toolbar"><div><span className="toolbar-label">CAMPUS FEED</span><strong>{notices.length} updates available</strong></div><button className="filter-button"><Bell size={15} /> All updates <ChevronDown size={14} /></button></div><div className="notice-card-grid">{notices.length ? notices.map((notice) => <article className="notice-card" key={notice.id}><div className={`notice-card-accent ${notice.priority.toLowerCase()}`} /><div className="notice-card-meta"><span>{notice.category}</span><span>{notice.publishedAt}</span></div><h2>{notice.title}</h2><p>{notice.summary}</p><button className="card-link">Read update <ArrowRight size={14} /></button></article>) : <EmptyPage icon={Bell} title="No notices right now" text="New campus updates will appear here as soon as they are published." />}</div></div>;
}

function DeadlinesPage({ deadlines }) {
  return <div className="dedicated-page deadlines-page"><div className="deadline-summary"><div><span className="toolbar-label">ACADEMIC RHYTHM</span><strong>{deadlines.length ? `${deadlines.length} commitments ahead` : "A clear week ahead"}</strong><p>Keep your momentum by knowing what is coming next.</p></div><div className="progress-ring"><span>{deadlines.length}</span><small>open</small></div></div>{deadlines.length ? <div className="timeline-list">{deadlines.map((item, index) => <article className="timeline-item" key={item.id}><div className="timeline-marker">{index + 1}</div><div className="timeline-date"><strong>{new Date(item.due).getDate()}</strong><span>{new Date(item.due).toLocaleDateString("en-US", { month: "short" })}</span></div><div className="timeline-copy"><span>{item.type} · {item.status}</span><h2>{item.title}</h2><p>{item.course}</p></div><ChevronRight className="row-chevron" size={18} /></article>)}</div> : <EmptyPage icon={Clock3} title="Your schedule is clear" text="No assignments or deadlines are scheduled at the moment." />}</div>;
}

function ExaminationsPage({ exams }) {
  return <div className="dedicated-page exams-page"><div className="exam-hero"><div><span className="toolbar-label">EXAM READINESS</span><h2>Prepare with confidence.</h2><p>Your upcoming examinations, organized in one focused view.</p></div><div className="exam-hero-icon"><BookOpen size={29} /></div></div><div className="exam-grid">{exams.length ? exams.map((exam) => <article className="exam-card" key={exam.id}><div className="exam-date"><span>{new Date(exam.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span><strong>{new Date(exam.date).getDate()}</strong></div><div><span className="exam-type">{exam.type || "EXAMINATION"}</span><h3>{exam.title || exam.subject}</h3><p>{exam.course || exam.subject || "Academic examination"} · {exam.time || "Schedule to be announced"}</p></div><ChevronRight size={17} /></article>) : <EmptyPage icon={CalendarDays} title="No examinations scheduled" text="Your examination timetable will appear here when it is published." />}</div></div>;
}

function CalendarPage({ deadlines, exams }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return <div className="dedicated-page calendar-page"><div className="calendar-toolbar"><button className="calendar-nav"><ChevronRight size={17} className="rotate-180" /></button><div><span className="toolbar-label">CURRENT TERM</span><strong>October 2026</strong></div><button className="calendar-nav"><ChevronRight size={17} /></button></div><div className="calendar-board"><div className="calendar-week">{days.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: 35 }, (_, index) => { const day = index - 3; const hasDeadline = deadlines.some((item) => new Date(item.due).getDate() === day); const hasExam = exams.some((item) => new Date(item.date).getDate() === day); return <div className={day === 24 ? "calendar-day today" : "calendar-day"} key={index}>{day > 0 && day <= 31 && <><strong>{day}</strong>{hasDeadline && <i className="calendar-dot deadline-dot" />}{hasExam && <i className="calendar-dot exam-dot" />}</>}</div>; })}</div></div><div className="calendar-legend"><span><i className="calendar-dot deadline-dot" /> Deadlines</span><span><i className="calendar-dot exam-dot" /> Examinations</span><span><i className="calendar-dot today-dot" /> Today</span></div></div>;
}

function AssistantPage() {
  return <div className="dedicated-page assistant-page"><div className="assistant-hero"><span className="assistant-orb"><Sparkles size={26} /></span><div><span className="toolbar-label">CAMPUSPULSE AI</span><h2>Your academic co-pilot.</h2><p>Get clear answers about notices, deadlines, courses, and campus life.</p></div></div><div className="assistant-suggestions"><span>Try asking</span>{["What is due this week?", "Summarize my latest notices", "Help me plan my exams"].map((suggestion) => <button key={suggestion}>{suggestion}<ArrowUpRight size={14} /></button>)}</div><div className="assistant-composer"><div className="assistant-message"><Sparkles size={17} /><span>Hi! What would you like to know about your campus?</span></div><div className="composer-row"><input placeholder="Ask anything about your campus..." /><button><ArrowRight size={17} /></button></div></div></div>;
}

function EmptyPage({ icon: Icon, title, text }) {
  return <div className="full-empty"><span className="empty-icon"><Icon size={22} /></span><strong>{title}</strong><p>{text}</p></div>;
}

function Overview({ user, data }) {
  const isStudent = user.role === "student";
  const cards = isStudent ? [["Unread notices", data.stats.unreadNotices, "Needs your attention", Bell], ["Pending assignments", data.stats.pendingAssignments, "Keep your momentum", FileText], ["Upcoming deadlines", data.stats.upcomingDeadlines, "Across your courses", Clock3], ["Examinations", data.stats.upcomingExams, "Next 30 days", CalendarDays]] : [["Published notices", data.stats.publishedNotices, "This semester", FileText], ["Pending approvals", data.stats.pendingApprovals, "Awaiting review", Clock3], ["Active students", data.stats.activeStudents, "Across departments", Users], ["Upcoming events", data.stats.upcomingEvents, "This month", CalendarDays]];
  return <><div className="overview-banner"><div><span className="live-dot" /> <strong>Workspace overview</strong><span>Live campus intelligence</span></div><span className="overview-date">Updated just now</span></div><div className="stats-grid">{cards.map(([label, value, detail, Icon], index) => <article className={`stat-card stat-card-${index + 1}`} key={label}><div className="stat-card-top"><div className="stat-icon"><Icon size={18} /></div><span className="stat-menu">•••</span></div><p>{label}</p><strong>{value}</strong><small><span className="stat-trend">↗</span> {detail}</small></article>)}</div><div className="dashboard-grid"><section className="panel notice-panel"><div className="panel-title"><div><p className="eyebrow">LATEST UPDATES</p><h2>Recent notices</h2></div><button className="text-button">View all <ChevronRight size={15} /></button></div>{data.notices.length ? data.notices.map((notice) => <article className="notice-row" key={notice.id}><div className={`priority ${notice.priority.toLowerCase()}`} /><div className="notice-content"><div className="notice-meta"><span>{notice.category}</span><span>·</span><span>{notice.publishedAt}</span></div><h3>{notice.title}</h3><p>{notice.summary}</p></div><ChevronRight className="row-chevron" size={18} /></article>) : <div className="empty-state"><span className="empty-icon"><Bell size={21} /></span><strong>You are all caught up</strong><p>No new notices need your attention right now.</p></div>}</section>{isStudent ? <section className="panel"><div className="panel-title"><div><p className="eyebrow">YOUR WEEK</p><h2>Upcoming deadlines</h2></div><button className="text-button">Calendar <ChevronRight size={15} /></button></div>{data.deadlines.length ? <div className="deadline-list">{data.deadlines.map((item) => <div className="deadline-row" key={item.id}><div className="date-block"><strong>{new Date(item.due).getDate()}</strong><span>{new Date(item.due).toLocaleDateString("en-US", { month: "short" })}</span></div><div><h3>{item.title}</h3><p>{item.course} · {item.status}</p></div><span className="deadline-type">{item.type}</span></div>)}</div> : <div className="empty-state"><span className="empty-icon calendar-empty"><CalendarDays size={21} /></span><strong>Your schedule is clear</strong><p>No upcoming deadlines are scheduled.</p></div>}</section> : <section className="panel activity-panel"><div className="panel-title"><div><p className="eyebrow">SYSTEM PULSE</p><h2>Recent activity</h2></div></div>{["Notice approval queue reviewed", "12 student accounts provisioned", "Weekly digest scheduled"].map((activity, index) => <div className="activity-row" key={activity}><span className="activity-dot" /><div><strong>{activity}</strong><p>{index + 1} hour{index ? "s" : ""} ago</p></div></div>)}</section>}</div></>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
