const { Op } = require("sequelize");
const Attendance = require("./attendance.model");

const findByExamId = async (examId) => {
    return await Attendance.findAll({ where: { exam_id: examId } });
};

const findOne = async (examId, studentId) => {
    return await Attendance.findOne({ where: { exam_id: examId, student_id: studentId } });
};

const upsert = async (examId, studentId, status, roomNumber, seatNumber) => {
    const existing = await Attendance.findOne({ where: { exam_id: examId, student_id: studentId } });

    if (existing) {
        existing.status = status;
        if (roomNumber !== undefined) existing.room_number = roomNumber;
        if (seatNumber !== undefined) existing.seat_number = seatNumber;
        await existing.save();
        return existing;
    }

    return await Attendance.create({
        exam_id: examId,
        student_id: studentId,
        status,
        room_number: roomNumber || null,
        seat_number: seatNumber || null
    });
};

module.exports = {
    findByExamId,
    findOne,
    upsert
};
