const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./shared/middleware/errorHandler");
const sequelize = require("./config/database");
require("dotenv").config();

const authRoutes = require("./modules/auth");
const studentsRoute = require("./modules/std_mng");
const staffRoutes = require("./modules/staff_mng");
const departmentRoutes = require("./modules/dept_mng");
const courseRoutes = require("./modules/course_mng");
const subjectRoutes = require("./modules/subject_mng");
const roomRoutes = require("./modules/room_mng");
const { examRoutes, timetableRoutes } = require("./modules/exam_mng");
const { allocationRoutes, allocationItemRoutes } = require("./modules/allocation_mng");
const { dutyRoutes, dutyItemRoutes, dutyMyRoutes } = require("./modules/duty_mng");
const seatRoutes = require("./modules/seating_mng");
const { admitcardRoutes, admitcardSelfRoutes } = require("./modules/admitcard_mng");
const attendanceRoutes = require("./modules/attendance_mng");
const notificationRoutes = require("./modules/notification_mng");
const issueRoutes = require("./modules/issue_mng");
const reportRoutes = require("./modules/report_mng");
const auditRoutes = require("./modules/audit_mng");
const userRoutes = require("./modules/user_mng");
const dashboardRoutes = require("./modules/dashboard_mng");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5174", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ---- Auth ----
app.use("/api/v1/auth", authRoutes);

// ---- Dashboards ----
// Mounted at the API root since this router defines its own full paths
// (/admin/dashboard, /staff/dashboard, /student/dashboard). Registered
// early — its exact 2-segment routes never shadow anything else mounted
// after it (see the /staff/duties note below for why mount ORDER matters
// on this project).
app.use("/api/v1", dashboardRoutes);

// ---- Students ----
app.use("/api/v1/students", studentsRoute);

// ---- Staff ----
// IMPORTANT: /staff/duties must be mounted BEFORE the general /staff
// router. staff.routes.js has `GET /:id` (fetch staff by id) — since
// Express matches app.use prefixes in registration order, if the general
// /staff router were registered first, a request to GET /api/v1/staff/duties
// would incorrectly match /:id with id="duties" before ever reaching this
// "my duties" router. Mounting the more specific path first avoids that.
app.use("/api/v1/staff/duties", dutyMyRoutes);
app.use("/api/v1/staff", staffRoutes);

// ---- Academic structure ----
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/rooms", roomRoutes);

// ---- Exams, timetable, and their nested sub-resources ----
app.use("/api/v1/exams/:examId/room-allocations", allocationRoutes);
app.use("/api/v1/exams/:examId/staff-duties", dutyRoutes);
app.use("/api/v1/exams/:examId/attendance", attendanceRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/timetable", timetableRoutes);

// ---- Standalone item routes for the nested resources above ----
app.use("/api/v1/room-allocations/:allocationId/seating", seatRoutes);
app.use("/api/v1/room-allocations", allocationItemRoutes);
app.use("/api/v1/staff-duties", dutyItemRoutes);

// ---- Admit cards ----
app.use("/api/v1/admit-cards", admitcardRoutes);
app.use("/api/v1/student/admit-card", admitcardSelfRoutes);

// ---- Communication & monitoring ----
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/audit-logs", auditRoutes);

// ---- User accounts ----
app.use("/api/v1/users", userRoutes);

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ success: true, message: "OK" });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");

        await sequelize.sync(sequelize.syncOptions);
        console.log("Database synced");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = app;
