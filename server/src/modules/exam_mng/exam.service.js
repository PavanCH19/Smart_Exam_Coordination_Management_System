const examRepository = require("./exam.repository");
const subjectRepository = require("../subject_mng/subject.repository");
const ApiError = require("../../shared/utils/ApiError");
const auditService = require("../audit_mng/audit.service");

// Sequelize returns the joined Subject as exam.Subject — flatten it so the
// frontend gets subject_name/subject_code directly on the exam object, as
// documented in the API contract.
const shapeExam = (examInstance) => {
    if (!examInstance) return null;

    const exam = examInstance.toJSON ? examInstance.toJSON() : examInstance;
    const subject = exam.Subject || {};

    return {
        exam_id: exam.exam_id,
        subject_id: exam.subject_id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        department: exam.department,
        semester: exam.semester,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        status: exam.status
    };
};

const addExam = async ({ subject_id, exam_date, start_time, end_time, status }) => {

    const subject = await subjectRepository.findSubjectById(subject_id);

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    if (start_time >= end_time) {
        throw new ApiError(400, "end_time must be after start_time");
    }

    const exam = await examRepository.insertExam({
        subject_id,
        department: subject.department,
        semester: subject.semester,
        exam_date,
        start_time,
        end_time,
        status: status || "SCHEDULED"
    });

    return shapeExam(await examRepository.findExamById(exam.exam_id));
};

const getAllExams = async (filters, page, limit) => {
    const { rows, count } = await examRepository.findAllExams(filters, page, limit);

    return {
        exams: rows.map(shapeExam),
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getExamsByFilters = async (filters) => {
    const exams = await examRepository.findExamsByFilters(filters);
    return exams.map(shapeExam);
};

const getExamById = async (examId) => {

    const exam = await examRepository.findExamById(examId);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    return shapeExam(exam);
};

const updateExam = async (examId, updates) => {

    const existingExam = await examRepository.findExamById(examId);

    if (!existingExam) {
        throw new ApiError(404, "Exam not found");
    }

    const payload = { ...updates };

    // Re-derive department/semester whenever the subject changes, so they
    // never drift out of sync with the subject actually being examined.
    if (updates.subject_id && updates.subject_id !== existingExam.subject_id) {
        const subject = await subjectRepository.findSubjectById(updates.subject_id);

        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }

        payload.department = subject.department;
        payload.semester = subject.semester;
    } else {
        delete payload.department;
        delete payload.semester;
    }

    const startTime = updates.start_time || existingExam.start_time;
    const endTime = updates.end_time || existingExam.end_time;

    if (startTime >= endTime) {
        throw new ApiError(400, "end_time must be after start_time");
    }

    await examRepository.updateExam(examId, payload);

    return shapeExam(await examRepository.findExamById(examId));
};

const deleteExam = async (examId) => {

    const exam = await examRepository.findExamById(examId);

    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    await examRepository.deleteExam(examId);

    return { message: "Exam deleted successfully" };
};

// ---------- Timetable generation ----------
// Basic constraint-based scheduler (matches the project brief's "Basic
// Algorithm"): for every subject in the department+semester that doesn't
// already have a scheduled exam, walk the date range day by day and place
// it on the first day that doesn't already have another exam for the same
// department+semester (this is the "a student cannot sit two exams on the
// same day" constraint — the dominant real-world conflict). Room/staff
// allocation is handled afterwards by the Allocation module, not here.
const DEFAULT_START_TIME = "10:00";

const addMinutesToTime = (time, minutes) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const normalized = ((total % 1440) + 1440) % 1440;
    const outH = String(Math.floor(normalized / 60)).padStart(2, "0");
    const outM = String(normalized % 60).padStart(2, "0");
    return `${outH}:${outM}`;
};

const dateRange = (start, end) => {
    const dates = [];
    const cursor = new Date(start);
    const last = new Date(end);

    while (cursor <= last) {
        dates.push(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
};

const generateTimetable = async ({ department, semester, start_date, end_date }, actor = {}) => {

    const normalizedSemester = Number(semester);
    const toDate = (value) => {
        if (value instanceof Date) return value;
        return new Date(`${value}T00:00:00Z`);
    };
    const normalizedStartDate = toDate(start_date);
    const normalizedEndDate = toDate(end_date);

    if (!department || !Number.isInteger(normalizedSemester) || Number.isNaN(normalizedStartDate.getTime()) || Number.isNaN(normalizedEndDate.getTime())) {
        throw new ApiError(400, "Department, semester, start date and end date are required");
    }

    if (normalizedStartDate > normalizedEndDate) {
        throw new ApiError(400, "End date must be on or after start date");
    }

    const allSubjects = await subjectRepository.findAllSubjects(
        { department, semester: normalizedSemester },
        null,
        1,
        1000
    );

    const subjects = allSubjects.rows;

    if (subjects.length === 0) {
        throw new ApiError(404, "No subjects found for this department and semester");
    }

    const existingExams = await examRepository.findExamsByDepartmentSemesterInRange(
        department,
        normalizedSemester,
        normalizedStartDate,
        normalizedEndDate
    );

    const scheduledSubjectIds = new Set(existingExams.map((exam) => exam.subject_id));
    const occupiedDates = new Set(existingExams.map((exam) => {
        const value = exam.exam_date instanceof Date ? exam.exam_date : new Date(exam.exam_date);
        return Number.isNaN(value.getTime()) ? String(exam.exam_date).slice(0, 10) : value.toISOString().slice(0, 10);
    }));

    const candidateDates = dateRange(normalizedStartDate, normalizedEndDate);
    const created = [];
    const conflicts = [];

    for (const subject of subjects) {

        if (scheduledSubjectIds.has(subject.subject_id)) {
            continue; // already has an exam — nothing to schedule
        }

        const freeDate = candidateDates.find((date) => !occupiedDates.has(date));

        if (!freeDate) {
            conflicts.push({
                message: `Could not schedule ${subject.subject_code} — no free date left in the selected range`
            });
            continue;
        }

        const startTime = DEFAULT_START_TIME;
        const endTime = addMinutesToTime(startTime, subject.duration || 180);

        const exam = await examRepository.insertExam({
            subject_id: subject.subject_id,
            department,
            semester: normalizedSemester,
            exam_date: freeDate,
            start_time: startTime,
            end_time: endTime,
            status: "SCHEDULED"
        });

        occupiedDates.add(freeDate);
        created.push(shapeExam(await examRepository.findExamById(exam.exam_id)));
    }

    await auditService.writeLog({
        action: "TIMETABLE_GENERATED",
        performedBy: actor.id,
        performedByName: actor.name,
        target: `${department} — Semester ${semester}`,
        details: `${created.length} exam(s) scheduled, ${conflicts.length} conflict(s)`
    });

    return { created, conflicts };
};

module.exports = {
    addExam,
    getAllExams,
    getExamsByFilters,
    getExamById,
    updateExam,
    deleteExam,
    generateTimetable
};
