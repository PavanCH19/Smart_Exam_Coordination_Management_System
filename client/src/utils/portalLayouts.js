// Navigation is organised into labelled groups per role so the sidebar reads
// as a small set of categories instead of one long flat list of screens.
const portalLayouts = {
  ADMIN: [
    {
      section: "Overview",
      items: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      ],
    },
    {
      section: "People",
      items: [
        { to: "/admin/students", label: "Students", icon: "students" },
        { to: "/admin/staff", label: "Staff", icon: "staff" },
        { to: "/admin/users", label: "User Accounts", icon: "users" },
      ],
    },
    {
      section: "Academic Setup",
      items: [
        { to: "/admin/departments", label: "Departments", icon: "department" },
        { to: "/admin/courses", label: "Courses", icon: "course" },
        { to: "/admin/subjects", label: "Subjects", icon: "subject" },
        { to: "/admin/rooms", label: "Exam Halls", icon: "room" },
      ],
    },
    {
      section: "Scheduling",
      items: [
        { to: "/admin/exams", label: "Examinations", icon: "exam" },
        { to: "/admin/timetable", label: "Timetable", icon: "timetable" },
        { to: "/admin/allocations", label: "Room & Staff Allocation", icon: "allocation" },
        { to: "/admin/seating", label: "Seating", icon: "seating" },
      ],
    },
    {
      section: "Exam Day",
      items: [
        { to: "/admin/admit-cards", label: "Admit Cards", icon: "admitCard" },
        { to: "/admin/attendance", label: "Attendance", icon: "attendance" },
        { to: "/admin/issues", label: "Issues", icon: "issue" },
      ],
    },
    {
      section: "Insights",
      items: [
        { to: "/admin/notifications", label: "Notifications", icon: "notification" },
        { to: "/admin/reports", label: "Reports", icon: "report" },
        { to: "/admin/audit-logs", label: "Audit Logs", icon: "audit" },
      ],
    },
    {
      section: "Account",
      items: [
        { to: "/admin/change-password", label: "Change Password", icon: "lock" },
      ],
    },
  ],

  STAFF: [
    {
      section: "Overview",
      items: [
        { to: "/staff/dashboard", label: "Dashboard", icon: "dashboard" },
      ],
    },
    {
      section: "My Work",
      items: [
        { to: "/staff/duties", label: "Duty Roster", icon: "timetable" },
        { to: "/staff/attendance", label: "Attendance", icon: "attendance" },
        { to: "/staff/issues", label: "Report Issue", icon: "issue" },
      ],
    },
    {
      section: "Insights",
      items: [
        { to: "/staff/notifications", label: "Notifications", icon: "notification" },
      ],
    },
    {
      section: "Account",
      items: [
        { to: "/staff/change-password", label: "Change Password", icon: "lock" },
      ],
    },
  ],

  STUDENT: [
    {
      section: "Overview",
      items: [
        { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
      ],
    },
    {
      section: "Examinations",
      items: [
        { to: "/student/timetable", label: "Timetable", icon: "timetable" },
        { to: "/student/admit-card", label: "Admit Card", icon: "admitCard" },
        { to: "/student/venue-seat", label: "Venue & Seat", icon: "venue" },
      ],
    },
    {
      section: "Insights",
      items: [
        { to: "/student/notifications", label: "Notifications", icon: "notification" },
      ],
    },
    {
      section: "Account",
      items: [
        { to: "/student/change-password", label: "Change Password", icon: "lock" },
      ],
    },
  ],
};

export default portalLayouts;
