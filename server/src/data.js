export const users = [
  { id: "stu-1", name: "Aarav Mehta", email: "student@college.edu", password: "student123", role: "student", department: "Computer Science", semester: "6th" },
  { id: "fac-1", name: "Dr. Priya Sharma", email: "faculty@college.edu", password: "faculty123", role: "faculty", department: "Computer Science" },
  { id: "adm-1", name: "Nikhil Rao", email: "admin@college.edu", password: "admin123", role: "administrator", department: "Administration" }
];

export const notices = [
  { id: "notice-1", title: "End-semester examination registration", category: "Examination", priority: "High", audience: "All students", publishedAt: "2026-10-21", summary: "Complete the registration form before the deadline to receive your examination timetable.", status: "Unread" },
  { id: "notice-2", title: "Hackathon 2026 registrations are open", category: "Events", priority: "Medium", audience: "Computer Science", publishedAt: "2026-10-19", summary: "Build, ship, and present your best campus solution in the annual innovation sprint.", status: "Read" },
  { id: "notice-3", title: "Library hours extended during examinations", category: "Campus", priority: "Low", audience: "All students", publishedAt: "2026-10-16", summary: "The central library will remain open until 11:00 PM on weekdays.", status: "Read" }
];

export const deadlines = [
  { id: "deadline-1", title: "Database systems project", course: "CS 402", due: "2026-10-28", type: "Assignment", status: "In progress" },
  { id: "deadline-2", title: "Examination registration", course: "Academic office", due: "2026-10-25", type: "Administrative", status: "Pending" },
  { id: "deadline-3", title: "Machine learning lab report", course: "CS 416", due: "2026-11-03", type: "Assignment", status: "Not started" }
];

export const exams = [
  { subject: "Database Systems", code: "CS 402", date: "2026-11-10", time: "10:00 AM", room: "Hall B" },
  { subject: "Machine Learning", code: "CS 416", date: "2026-11-14", time: "2:00 PM", room: "Hall A" },
  { subject: "Software Engineering", code: "CS 410", date: "2026-11-18", time: "10:00 AM", room: "Hall C" }
];
