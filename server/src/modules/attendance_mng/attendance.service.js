const attendanceRepository = require("./attendance.repository");
const examRepository = require("../exam_mng/exam.repository");
const studentRepository = require("../std_mng/students.repository");
const staffRepository = require("../staff_mng/staff.repository");
const authRepository = require("../auth/auth.repository");
const ApiError = require("../../shared/utils/ApiError");

// Resolves the logged-in staff user's own room(s) for this exam, so their
// attendance actions can be scoped to students actually seated there.
const getStaffRoomNumbersForExam = async (userId, examId) => {
    const user = await authRepository.findUserById(userId);
    if (!user || !user.employee_id) return [];

    const staff = await staffRepository.findStaffByEmployeeId(user.employee_id);
    if (!staff) return [];

    const StaffDuty = require("../duty_mng/duty.model");
    const Room = require("../room_mng/room.model");

    const duties = await StaffDuty.findAll({
        where: { exam_id: examId, staff_id: staff.staff_id },
        include: [{ model: Room, attributes: ["room_number"] }]
    });

    return duties.map((duty) => duty.Room?.room_number).filter(Boolean);
};

const getRosterForExam = async (examId) => {

    const exam = await examRepository.findExamById(examId);
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    const { rows: students } = await studentRepository.findAllStudents(
        { department: exam.department, semester: exam.semester },
        1,
        1000
    );

    const Seat = require("../seating_mng/seat.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");
    const Room = require("../room_mng/room.model");

    const seats = await Seat.findAll({
        include: [{
            model: RoomAllocation,
            where: { exam_id: examId },
            include: [{ model: Room, attributes: ["room_number"] }]
        }]
    });

    const seatByStudentId = new Map(
        seats.map((seat) => [
            seat.student_id,
            {
                room_number: seat.RoomAllocation?.Room?.room_number || null,
                seat_number: seat.seat_number
            }
        ])
    );

    const attendanceRows = await attendanceRepository.findByExamId(examId);
    const attendanceByStudentId = new Map(attendanceRows.map((row) => [row.student_id, row.status]));

    return students.map((student) => {
        const seatInfo = seatByStudentId.get(student.student_id) || {};

        return {
            student_id: student.student_id,
            usn: student.usn,
            name: student.name,
            room_number: seatInfo.room_number || null,
            seat_number: seatInfo.seat_number || null,
            status: attendanceByStudentId.get(student.student_id) || null
        };
    });
};

const markAttendance = async (examId, studentId, status, userId, isStaff) => {

    const exam = await examRepository.findExamById(examId);
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    const student = await studentRepository.findStudentById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    let roomNumber;
    let seatNumber;

    const Seat = require("../seating_mng/seat.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");
    const Room = require("../room_mng/room.model");

    const seat = await Seat.findOne({
        where: { student_id: studentId },
        include: [{
            model: RoomAllocation,
            where: { exam_id: examId },
            include: [{ model: Room, attributes: ["room_number"] }]
        }]
    });

    if (seat) {
        roomNumber = seat.RoomAllocation?.Room?.room_number;
        seatNumber = seat.seat_number;
    }

    if (isStaff) {
        const allowedRooms = await getStaffRoomNumbersForExam(userId, examId);

        if (allowedRooms.length === 0) {
            throw new ApiError(403, "You do not have a duty on this exam");
        }

        if (roomNumber && !allowedRooms.includes(roomNumber)) {
            throw new ApiError(403, "This student is not seated in your assigned room");
        }
    }

    await attendanceRepository.upsert(examId, studentId, status, roomNumber, seatNumber);

    return { student_id: studentId, status };
};

const bulkMarkAttendance = async (examId, updates, userId, isStaff) => {

    const results = [];

    for (const update of updates) {
        // eslint-disable-next-line no-await-in-loop
        const result = await markAttendance(examId, update.student_id, update.status, userId, isStaff);
        results.push(result);
    }

    return { updated: results.length };
};

module.exports = {
    getRosterForExam,
    markAttendance,
    bulkMarkAttendance
};
