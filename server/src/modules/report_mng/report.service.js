const PDFDocument = require("pdfkit");

const ApiError = require("../../shared/utils/ApiError");

// ---------- Per-type data builders ----------
// Each returns { summary: {...flat scalars...}, rows: [...detail records...] }
// summary powers the dashboard tile view; rows power CSV/PDF export.

const buildExamsReport = async () => {
    const Exam = require("../exam_mng/exam.model");
    const Subject = require("../subject_mng/subject.model");

    const exams = await Exam.findAll({
        include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }],
        order: [["exam_date", "ASC"]]
    });

    const summary = {
        total_exams: exams.length,
        scheduled: exams.filter((e) => e.status === "SCHEDULED").length,
        completed: exams.filter((e) => e.status === "COMPLETED").length,
        cancelled: exams.filter((e) => e.status === "CANCELLED").length
    };

    const rows = exams.map((e) => ({
        exam_id: e.exam_id,
        subject: e.Subject ? `${e.Subject.subject_code} - ${e.Subject.subject_name}` : "",
        department: e.department,
        semester: e.semester,
        exam_date: e.exam_date,
        start_time: e.start_time,
        end_time: e.end_time,
        status: e.status
    }));

    return { summary, rows };
};

const buildStaffDutyReport = async () => {
    const StaffDuty = require("../duty_mng/duty.model");
    const Staff = require("../staff_mng/staff.model");
    const Exam = require("../exam_mng/exam.model");
    const Room = require("../room_mng/room.model");

    const duties = await StaffDuty.findAll({
        include: [
            { model: Staff, attributes: ["name", "employee_id"] },
            { model: Exam, attributes: ["exam_date"] },
            { model: Room, attributes: ["room_number"] }
        ]
    });

    const distinctStaff = new Set(duties.map((d) => d.staff_id));

    const summary = {
        total_duties: duties.length,
        main_duties: duties.filter((d) => d.duty_type === "MAIN").length,
        standby_duties: duties.filter((d) => d.duty_type === "STANDBY").length,
        staff_involved: distinctStaff.size
    };

    const rows = duties.map((d) => ({
        duty_id: d.duty_id,
        staff: d.Staff ? `${d.Staff.name} (${d.Staff.employee_id})` : "",
        exam_date: d.Exam ? d.Exam.exam_date : "",
        room: d.Room ? d.Room.room_number : "",
        duty_type: d.duty_type,
        status: d.status
    }));

    return { summary, rows };
};

const buildHallUtilizationReport = async () => {
    const Room = require("../room_mng/room.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");

    const rooms = await Room.findAll();
    const allocations = await RoomAllocation.findAll();

    const allocatedByRoom = new Map();
    allocations.forEach((a) => {
        allocatedByRoom.set(a.room_id, (allocatedByRoom.get(a.room_id) || 0) + a.student_count);
    });

    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalAllocated = allocations.reduce((sum, a) => sum + a.student_count, 0);

    const summary = {
        total_rooms: rooms.length,
        available_rooms: rooms.filter((r) => r.status === "AVAILABLE").length,
        total_capacity: totalCapacity,
        utilization_percent: totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0
    };

    const rows = rooms.map((r) => ({
        room_number: r.room_number,
        building: r.building,
        capacity: r.capacity,
        allocated: allocatedByRoom.get(r.room_id) || 0,
        status: r.status
    }));

    return { summary, rows };
};

const buildAttendanceReport = async () => {
    const Attendance = require("../attendance_mng/attendance.model");
    const Student = require("../std_mng/students.model");
    const Exam = require("../exam_mng/exam.model");

    const records = await Attendance.findAll({
        include: [
            { model: Student, attributes: ["usn", "name"] },
            { model: Exam, attributes: ["exam_date"] }
        ]
    });

    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const marked = present + absent;

    const summary = {
        total_marked: marked,
        present,
        absent,
        attendance_percent: marked > 0 ? Math.round((present / marked) * 100) : 0
    };

    const rows = records.map((r) => ({
        exam_date: r.Exam ? r.Exam.exam_date : "",
        usn: r.Student ? r.Student.usn : "",
        name: r.Student ? r.Student.name : "",
        room_number: r.room_number,
        seat_number: r.seat_number,
        status: r.status || "NOT MARKED"
    }));

    return { summary, rows };
};

const buildIssuesReport = async () => {
    const Issue = require("../issue_mng/issue.model");

    const issues = await Issue.findAll();

    const summary = {
        total_issues: issues.length,
        open: issues.filter((i) => i.status === "OPEN").length,
        in_progress: issues.filter((i) => i.status === "IN PROGRESS").length,
        resolved: issues.filter((i) => i.status === "RESOLVED").length
    };

    const rows = issues.map((i) => ({
        issue_id: i.issue_id,
        type: i.issue_type,
        description: i.description,
        room_number: i.room_number,
        reported_by: i.reported_by_name,
        status: i.status,
        created_at: i.created_at
    }));

    return { summary, rows };
};

const buildAdmitCardsReport = async () => {
    const AdmitCard = require("../admitcard_mng/admitcard.model");
    const Student = require("../std_mng/students.model");

    const students = await Student.findAll();
    const cards = await AdmitCard.findAll();
    const cardByStudentId = new Map(cards.map((c) => [c.student_id, c]));

    const ready = students.filter((s) => cardByStudentId.get(s.student_id)?.admit_card_status === "READY").length;

    const summary = {
        total_students: students.length,
        ready,
        pending: students.length - ready
    };

    const rows = students.map((s) => ({
        usn: s.usn,
        name: s.name,
        department: s.department,
        semester: s.semester,
        status: cardByStudentId.get(s.student_id)?.admit_card_status || "PENDING"
    }));

    return { summary, rows };
};

const BUILDERS = {
    "exams": buildExamsReport,
    "staff-duty": buildStaffDutyReport,
    "hall-utilization": buildHallUtilizationReport,
    "attendance": buildAttendanceReport,
    "issues": buildIssuesReport,
    "admit-cards": buildAdmitCardsReport
};

const getReport = async (type) => {
    const builder = BUILDERS[type];
    if (!builder) {
        throw new ApiError(404, `Unknown report type: ${type}`);
    }

    const { summary } = await builder();
    return summary;
};

// ---------- Export ----------

const toCsv = (rows) => {
    if (rows.length === 0) return "No data available\n";

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        const str = value === null || value === undefined ? "" : String(value);
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };

    const lines = [headers.join(",")];
    rows.forEach((row) => {
        lines.push(headers.map((h) => escape(row[h])).join(","));
    });

    return lines.join("\n");
};

const toPdf = (type, summary, rows) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc.fontSize(16).font("Helvetica-Bold").text(`Report: ${type}`, { align: "center" });
        doc.moveDown(1);

        doc.fontSize(11).font("Helvetica-Bold").text("Summary");
        doc.font("Helvetica").fontSize(9);
        Object.entries(summary).forEach(([key, value]) => {
            doc.text(`${key.replace(/_/g, " ")}: ${value}`);
        });
        doc.moveDown(1);

        doc.fontSize(11).font("Helvetica-Bold").text(`Detail (${rows.length} rows)`);
        doc.font("Helvetica").fontSize(8);

        rows.slice(0, 200).forEach((row) => {
            doc.text(Object.values(row).map((v) => String(v ?? "")).join("  |  "));
        });

        if (rows.length > 200) {
            doc.moveDown(0.5).text(`... and ${rows.length - 200} more row(s). Export as CSV for the full dataset.`);
        }

        doc.end();
    });
};

const exportReport = async (type, format) => {
    const builder = BUILDERS[type];
    if (!builder) {
        throw new ApiError(404, `Unknown report type: ${type}`);
    }

    const { summary, rows } = await builder();

    if (format === "csv") {
        return { buffer: Buffer.from(toCsv(rows), "utf-8"), contentType: "text/csv" };
    }

    const pdfBuffer = await toPdf(type, summary, rows);
    return { buffer: pdfBuffer, contentType: "application/pdf" };
};

module.exports = {
    getReport,
    exportReport
};
