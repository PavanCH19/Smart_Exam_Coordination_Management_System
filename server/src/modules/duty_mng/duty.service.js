const dutyRepository = require("./duty.repository");
const examRepository = require("../exam_mng/exam.repository");
const roomRepository = require("../room_mng/room.repository");
const staffRepository = require("../staff_mng/staff.repository");
const authRepository = require("../auth/auth.repository");
const auditService = require("../audit_mng/audit.service");
const ApiError = require("../../shared/utils/ApiError");
const mailer = require("../../shared/utils/mailer");
const { dutyAssignmentEmailTemplate } = require("../../shared/utils/emailTemplates");
const User = require("../auth/user.model");
const { Notification } = require("../notification_mng/notification.model");

// The JWT only carries { id, role } (the users table PK) — resolve that
// back to the staff profile (via users.employee_id) whenever a "my duties"
// style endpoint needs to know which staff row the logged-in user actually is.
const resolveStaffFromUserId = async (userId) => {
    const user = await authRepository.findUserById(userId);

    if (!user || !user.employee_id) {
        throw new ApiError(404, "No staff profile is linked to this account");
    }

    const staff = await staffRepository.findStaffByEmployeeId(user.employee_id);

    if (!staff) {
        throw new ApiError(404, "Staff profile not found for this account");
    }

    return staff;
};

const shapeDuty = (dutyInstance) => {
    if (!dutyInstance) return null;

    const duty = dutyInstance.toJSON ? dutyInstance.toJSON() : dutyInstance;
    const staff = duty.Staff || {};
    const room = duty.Room || {};

    return {
        duty_id: duty.duty_id,
        exam_id: duty.exam_id,
        staff_id: staff.employee_id,
        staff_name: staff.name,
        room_id: duty.room_id,
        room_number: room.room_number,
        duty_type: duty.duty_type,
        status: duty.status
    };
};

const shapeMyDuty = (dutyInstance) => {
    if (!dutyInstance) return null;

    const duty = dutyInstance.toJSON ? dutyInstance.toJSON() : dutyInstance;
    const exam = duty.Exam || {};
    const subject = exam.Subject || {};
    const room = duty.Room || {};

    return {
        duty_id: duty.duty_id,
        exam_id: duty.exam_id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        room_number: room.room_number,
        building: room.building,
        duty_type: duty.duty_type,
        status: duty.status
    };
};

// Staff cannot be assigned to two overlapping duties across different exams.
const assertStaffNotDoubleBooked = async (staffId, examId, excludeDutyId = null) => {
    const StaffDuty = require("./duty.model");
    const Exam = require("../exam_mng/exam.model");

    const exam = await examRepository.findExamById(examId);

    const existingDuties = await StaffDuty.findAll({
        where: { staff_id: staffId },
        include: [{ model: Exam }]
    });

    for (const duty of existingDuties) {
        if (excludeDutyId && duty.duty_id === Number(excludeDutyId)) continue;
        if (duty.exam_id === Number(examId)) continue;

        const otherExam = duty.Exam;
        if (!otherExam) continue;

        const sameDate = otherExam.exam_date && exam.exam_date &&
            new Date(otherExam.exam_date).toDateString() === new Date(exam.exam_date).toDateString();

        if (!sameDate) continue;

        const overlap = exam.start_time < otherExam.end_time && otherExam.start_time < exam.end_time;

        if (overlap) {
            throw new ApiError(409, "This staff member already has a duty at an overlapping time");
        }
    }
};

const addDuty = async (examId, { staff_id, room_id, duty_type }) => {

    const exam = await examRepository.findExamById(examId);
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    const staff = await staffRepository.findStaffByEmployeeId(staff_id);
    if (!staff) {
        throw new ApiError(404, "Staff member not found");
    }

    if (staff.availability !== "AVAILABLE") {
        throw new ApiError(409, "This staff member is marked unavailable");
    }

    const room = await roomRepository.findRoomById(room_id);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const existingDuty = await dutyRepository.findDutyByExamAndStaff(examId, staff.staff_id);
    if (existingDuty) {
        throw new ApiError(409, "This staff member already has a duty for this exam");
    }

    await assertStaffNotDoubleBooked(staff.staff_id, examId);

    const duty = await dutyRepository.insertDuty({
        exam_id: examId,
        staff_id: staff.staff_id,
        room_id,
        duty_type,
        status: "ASSIGNED"
    });

    const activeDuties = await dutyRepository.findDutiesByStaffId(staff.staff_id);
    const assignments = activeDuties.map((item) => {
        const shaped = shapeMyDuty(item);
        return `${shaped.exam_date} ${shaped.start_time}-${shaped.end_time}: ${shaped.building || ""} ${shaped.room_number || "TBA"}`.trim();
    });
    const message = assignments.join("\n");
    const user = await User.findOne({ where: { employee_id: staff.employee_id } });

    if (user) {
        const notification = await Notification.create({
            title: "Examination duty assigned",
            message,
            audience: "STAFF",
            type: "REMINDER",
            recipient_user_id: user.id
        });
        const email = dutyAssignmentEmailTemplate({ name: staff.name, message });
        mailer.sendMail({ to: staff.email, ...email }).catch((error) => {
            console.error("[duty] Assignment email failed:", error.message);
        });
        void notification;
    }

    return shapeDuty(await dutyRepository.findDutyById(duty.duty_id));
};

const getDutiesByExamId = async (examId) => {
    const duties = await dutyRepository.findDutiesByExamId(examId);
    return duties.map(shapeDuty);
};

const getMyDuties = async (userId, scope) => {

    const staff = await resolveStaffFromUserId(userId);

    const duties = await dutyRepository.findDutiesByStaffId(staff.staff_id, scope);
    return duties.map(shapeMyDuty);
};

const getTodaysDutyForStaffUser = async (userId) => {
    const staff = await resolveStaffFromUserId(userId).catch(() => null);
    if (!staff) return null;

    const duty = await dutyRepository.findTodaysDutyForStaff(staff.staff_id);
    return duty ? shapeMyDuty(duty) : null;
};

const updateDuty = async (dutyId, updates) => {

    const existing = await dutyRepository.findDutyById(dutyId);
    if (!existing) {
        throw new ApiError(404, "Duty assignment not found");
    }

    const payload = {};

    if (updates.staff_id) {
        const staff = await staffRepository.findStaffByEmployeeId(updates.staff_id);
        if (!staff) throw new ApiError(404, "Staff member not found");
        if (staff.availability !== "AVAILABLE") {
            throw new ApiError(409, "This staff member is marked unavailable");
        }
        await assertStaffNotDoubleBooked(staff.staff_id, existing.exam_id, dutyId);
        payload.staff_id = staff.staff_id;
    }

    if (updates.room_id) payload.room_id = updates.room_id;
    if (updates.duty_type) payload.duty_type = updates.duty_type;

    await dutyRepository.updateDuty(dutyId, payload);

    return shapeDuty(await dutyRepository.findDutyById(dutyId));
};

const deleteDuty = async (dutyId, actor = {}) => {

    const existing = await dutyRepository.findDutyById(dutyId);
    if (!existing) {
        throw new ApiError(404, "Duty assignment not found");
    }

    await dutyRepository.deleteDuty(dutyId);

    await auditService.writeLog({
        action: "STAFF_DUTY_REMOVED",
        performedBy: actor.id,
        target: `Exam #${existing.exam_id} — Staff #${existing.staff_id}`,
        details: null
    });

    return { message: "Staff duty removed successfully" };
};

const markDutyAttendance = async (dutyId, status, userId) => {

    const existing = await dutyRepository.findDutyById(dutyId);
    if (!existing) {
        throw new ApiError(404, "Duty assignment not found");
    }

    // A staff member may only confirm their own duty's attendance.
    if (userId) {
        const staff = await resolveStaffFromUserId(userId);
        if (staff.staff_id !== existing.staff_id) {
            throw new ApiError(403, "You can only confirm attendance for your own duty");
        }
    }

    await dutyRepository.updateDuty(dutyId, { status });

    return shapeDuty(await dutyRepository.findDutyById(dutyId));
};

module.exports = {
    addDuty,
    getDutiesByExamId,
    getMyDuties,
    getTodaysDutyForStaffUser,
    updateDuty,
    deleteDuty,
    markDutyAttendance
};
