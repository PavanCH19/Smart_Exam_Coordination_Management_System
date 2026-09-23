const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const admitcardRepository = require("./admitcard.repository");
const studentRepository = require("../std_mng/students.repository");
const authRepository = require("../auth/auth.repository");
const auditService = require("../audit_mng/audit.service");
const ApiError = require("../../shared/utils/ApiError");


// ---------- Status list / generation ----------

const getAdmitCards = async (filters) => {

    const { rows: students } = await studentRepository.findAllStudents(filters, 1, 1000);

    if (students.length === 0) {
        return [];
    }

    const studentIds = students.map((s) => s.student_id);
    const cards = await admitcardRepository.findByStudentIds(studentIds);
    const cardByStudentId = new Map(cards.map((card) => [card.student_id, card]));

    return students.map((student) => {
        const card = cardByStudentId.get(student.student_id);

        return {
            student_id: student.student_id,
            usn: student.usn,
            name: student.name,
            department: student.department,
            semester: student.semester,
            admit_card_status: card ? card.admit_card_status : "PENDING",
            generated_at: card ? card.generated_at : null
        };
    });
};

const generateAdmitCards = async (filters, actor = {}) => {

    const { rows: students } = await studentRepository.findAllStudents(filters, 1, 1000);

    if (students.length === 0) {
        throw new ApiError(404, "No students found for this filter");
    }

    for (const student of students) {
        // eslint-disable-next-line no-await-in-loop
        await admitcardRepository.upsertAdmitCard(student.student_id, "READY");
    }

    await auditService.writeLog({
        action: "ADMIT_CARDS_GENERATED",
        performedBy: actor.id,
        target: filters.department ? `${filters.department} — Sem ${filters.semester || "all"}` : "All students",
        details: `${students.length} admit card(s) generated`
    });

    return { generated: students.length };
};

// ---------- Student's own exam schedule (for the PDF body) ----------

const getStudentExamScheduleForAdmitCard = async (student) => {
    // Cross-cutting read, built directly from the underlying models to avoid
    // a circular module dependency — pulls each of the student's exams with
    // venue/seat where seating has been generated.
    const Exam = require("../exam_mng/exam.model");
    const Subject = require("../subject_mng/subject.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");
    const Room = require("../room_mng/room.model");
    const Seat = require("../seating_mng/seat.model");

    const exams = await Exam.findAll({
        where: { department: student.department, semester: student.semester },
        include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }],
        order: [["exam_date", "ASC"], ["start_time", "ASC"]]
    });

    const schedule = [];

    for (const exam of exams) {
        // eslint-disable-next-line no-await-in-loop
        const seat = await Seat.findOne({
            where: { student_id: student.student_id },
            include: [{
                model: RoomAllocation,
                where: { exam_id: exam.exam_id },
                include: [{ model: Room, attributes: ["room_number", "building"] }]
            }]
        }).catch(() => null);

        schedule.push({
            subject_name: exam.Subject?.subject_name,
            subject_code: exam.Subject?.subject_code,
            exam_date: exam.exam_date,
            start_time: exam.start_time,
            end_time: exam.end_time,
            room_number: seat?.RoomAllocation?.Room?.room_number || "TBA",
            building: seat?.RoomAllocation?.Room?.building || "TBA",
            seat_number: seat?.seat_number || "TBA"
        });
    }

    return schedule;
};

// ---------- PDF generation ----------
const NAVY = "#10233f";
const GOLD = "#f6d28d";
const BORDER = "#d8dee8";
const TEXT_DARK = "#1a1a1a";
const TEXT_MUTED = "#555555";
const ROW_ALT = "#f4f6fa";

const buildAdmitCardPdf = async (student) => {
    const schedule = await getStudentExamScheduleForAdmitCard(student);

    const qrPayload = JSON.stringify({
        student_id: student.student_id,
        usn: student.usn
    });
    const qrImageBuffer = await QRCode.toBuffer(qrPayload, {
        type: "png",
        errorCorrectionLevel: "H",
        margin: 2,
        width: 180,
        color: { dark: "#111827", light: "#FFFFFF" }
    });

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 0 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const pageW = doc.page.width;
        const pageH = doc.page.height;
        const margin = 32;
        const pad = margin + 14;
        const contentW = pageW - 2 * pad;

        // ---- outer double border frame ----
        doc.rect(margin, margin, pageW - 2 * margin, pageH - 2 * margin)
            .lineWidth(1.4).strokeColor(NAVY).stroke();
        doc.rect(margin + 4, margin + 4, pageW - 2 * margin - 8, pageH - 2 * margin - 8)
            .lineWidth(0.5).strokeColor(NAVY).stroke();

        // ---- title bar (same copy as before) ----
        let y = pad;
        doc.rect(pad, y, contentW, 60).fill(NAVY);
        doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(18)
            .text("EXAMINATION ADMIT CARD", pad, y + 14, { width: contentW, align: "center" });
        doc.fillColor("#ffffff").font("Helvetica").fontSize(9)
            .text("Smart Exam Coordination and Management System", pad, y + 38, { width: contentW, align: "center" });

        y += 60 + 20;

        // ---- section label helper ----
        const sectionLabel = (top, text) => {
            doc.rect(pad, top, 3, 16).fill(NAVY);
            doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(text.toUpperCase(), pad + 8, top + 3);
            return top + 22;
        };

        // ---- student details: two-column grid + QR on right ----
        y = sectionLabel(y, "Student Details");

        const qrSize = 110;
        const qrX = pad + contentW - qrSize;
        const qrY = y;
        const detailsW = contentW - qrSize - 16;

        doc.rect(pad, y, detailsW, qrSize).lineWidth(1).strokeColor(BORDER).stroke();

        const col1X = pad + 14;
        const col2X = pad + 14 + detailsW / 2;
        const fields = [
            ["Name", student.name, "USN", student.usn],
            ["Department", student.department, "Semester", student.semester],
            ["Section", student.section, "", ""]
        ];

        let fy = y + 16;
        const rowH = 30;
        fields.forEach(([l1, v1, l2, v2]) => {
            doc.fillColor(TEXT_MUTED).font("Helvetica-Bold").fontSize(7.5).text(l1.toUpperCase(), col1X, fy);
            doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(10).text(v1 || "", col1X, fy + 11);
            if (l2) {
                doc.fillColor(TEXT_MUTED).font("Helvetica-Bold").fontSize(7.5).text(l2.toUpperCase(), col2X, fy);
                doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(10).text(v2 || "", col2X, fy + 11);
            }
            fy += rowH;
        });

        doc.rect(qrX, qrY, qrSize, qrSize).lineWidth(1).strokeColor(BORDER).stroke();
        doc.image(qrImageBuffer, qrX + 5, qrY + 5, { width: qrSize - 10, height: qrSize - 10 - 12 });
        doc.fillColor(TEXT_MUTED).font("Helvetica").fontSize(6.5)
            .text("Scan to verify student identity", qrX, qrY + qrSize - 12, { width: qrSize, align: "center" });

        y += qrSize + 22;

        // ---- schedule table ----
        y = sectionLabel(y, "Examination Schedule");

        const colWidths = [55, 150, 70, 85, contentW - (55 + 150 + 70 + 85 + 40), 40];
        const headers = ["Code", "Subject", "Date", "Time", "Venue", "Seat"];
        const headerH = 20;
        const bodyRowH = 22;

        const truncate = (text, font, size, maxW) => {
            let t = text || "";
            doc.font(font).fontSize(size);
            while (doc.widthOfString(t) > maxW && t.length > 4) t = t.slice(0, -2);
            return t === (text || "") ? t : t + "…";
        };

        if (schedule.length === 0) {
            doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(10)
                .text("No examinations scheduled yet.", pad, y + 6);
            y += 30;
        } else {
            doc.rect(pad, y, contentW, headerH).fill(NAVY);
            let cx = pad;
            doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
            headers.forEach((h, i) => {
                doc.text(h, cx + 6, y + 6);
                cx += colWidths[i];
            });
            y += headerH;
            const tableTop = y - headerH;

            schedule.forEach((exam, i) => {
                if (i % 2 === 1) {
                    doc.rect(pad, y, contentW, bodyRowH).fill(ROW_ALT);
                }
                doc.moveTo(pad, y).lineTo(pad + contentW, y).lineWidth(0.4).strokeColor(BORDER).stroke();

                let cx = pad;
                const vals = [
                    exam.subject_code || "",
                    exam.subject_name || "",
                    exam.exam_date || "",
                    `${exam.start_time || ""}-${exam.end_time || ""}`,
                    `${exam.building || ""}${exam.room_number ? ", " + exam.room_number : ""}`,
                    exam.seat_number || ""
                ];

                doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(8)
                    .text(vals[0], cx + 6, y + 7);
                cx += colWidths[0];

                for (let idx = 1; idx < vals.length; idx++) {
                    const maxW = colWidths[idx] - 10;
                    const t = truncate(vals[idx], "Helvetica", 8, maxW);
                    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8).text(t, cx + 6, y + 7);
                    cx += colWidths[idx];
                }
                y += bodyRowH;
            });

            doc.rect(pad, tableTop, contentW, y - tableTop).lineWidth(0.7).strokeColor(BORDER).stroke();
        }

        y += 18;

        // ---- instructions ----
        y = sectionLabel(y, "Instructions");
        const instructions = [
            "Carry this admit card and a valid college ID to every examination.",
            "Report to the venue at least 30 minutes before the scheduled start time.",
            "Electronic devices are not permitted inside the examination hall.",
            "Seating is subject to change — check the seat number shown here on exam day."
        ];
        doc.font("Helvetica").fontSize(9).fillColor(TEXT_DARK);
        instructions.forEach((ins) => {
            doc.circle(pad + 4, y + 5, 1.3).fill(TEXT_DARK);
            doc.fillColor(TEXT_DARK).text(ins, pad + 12, y + 1, { width: contentW - 12 });
            y += 15;
        });

        doc.end();
    });
};


// ---------- Admin download ----------

const downloadAdmitCard = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const card = await admitcardRepository.findByStudentId(studentId);
    if (!card || card.admit_card_status !== "READY") {
        throw new ApiError(400, "This student's admit card has not been generated yet");
    }

    return await buildAdmitCardPdf(student);
};

// ---------- Student self-service ----------

const resolveStudentFromUserId = async (userId) => {
    const user = await authRepository.findUserById(userId);

    if (!user || !user.student_id) {
        throw new ApiError(404, "No student profile is linked to this account");
    }

    const student = await studentRepository.findStudentById(user.student_id);

    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    return student;
};

const getMyAdmitCard = async (userId) => {

    const student = await resolveStudentFromUserId(userId);
    const card = await admitcardRepository.findByStudentId(student.student_id);

    return {
        usn: student.usn,
        name: student.name,
        department: student.department,
        semester: student.semester,
        admit_card_status: card ? card.admit_card_status : "PENDING"
    };
};

const downloadMyAdmitCard = async (userId) => {

    const student = await resolveStudentFromUserId(userId);
    const card = await admitcardRepository.findByStudentId(student.student_id);

    if (!card || card.admit_card_status !== "READY") {
        throw new ApiError(400, "Your admit card has not been generated yet");
    }

    return await buildAdmitCardPdf(student);
};

module.exports = {
    getAdmitCards,
    generateAdmitCards,
    downloadAdmitCard,
    getMyAdmitCard,
    downloadMyAdmitCard,
    getStudentExamScheduleForAdmitCard
};
