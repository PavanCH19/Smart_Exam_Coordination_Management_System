const allocationRepository = require("./allocation.repository");
const examRepository = require("../exam_mng/exam.repository");
const roomRepository = require("../room_mng/room.repository");
const auditService = require("../audit_mng/audit.service");
const ApiError = require("../../shared/utils/ApiError");

const shapeAllocation = (allocationInstance) => {
    if (!allocationInstance) return null;

    const allocation = allocationInstance.toJSON ? allocationInstance.toJSON() : allocationInstance;
    const room = allocation.Room || {};

    return {
        allocation_id: allocation.allocation_id,
        exam_id: allocation.exam_id,
        room_id: allocation.room_id,
        room_number: room.room_number,
        building: room.building,
        capacity: room.capacity,
        student_count: allocation.student_count
    };
};

// Two exams on the same date with overlapping times cannot share a room —
// this is the "a room cannot host two exams simultaneously" hard constraint.
const assertRoomNotDoubleBooked = async (examId, roomId, excludeAllocationId = null) => {
    const exam = await examRepository.findExamById(examId);

    const RoomAllocation = require("./allocation.model");
    const conflicting = await RoomAllocation.findAll({ where: { room_id: roomId } });

    for (const other of conflicting) {
        if (excludeAllocationId && other.allocation_id === Number(excludeAllocationId)) continue;
        if (other.exam_id === Number(examId)) continue;

        const otherExam = await examRepository.findExamById(other.exam_id);
        if (!otherExam) continue;

        const sameDate = otherExam.exam_date && exam.exam_date &&
            new Date(otherExam.exam_date).toDateString() === new Date(exam.exam_date).toDateString();

        if (!sameDate) continue;

        const overlap = exam.start_time < otherExam.end_time && otherExam.start_time < exam.end_time;

        if (overlap) {
            throw new ApiError(409, `Room is already allocated to another exam on the same date/time`);
        }
    }
};

const addAllocation = async (examId, { room_id, student_count }) => {

    const exam = await examRepository.findExamById(examId);
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    const room = await roomRepository.findRoomById(room_id);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.status !== "AVAILABLE") {
        throw new ApiError(409, "This room is not currently available");
    }

    if (student_count > room.capacity) {
        throw new ApiError(400, `Student count (${student_count}) exceeds room capacity (${room.capacity})`);
    }

    const existing = await allocationRepository.findAllocationByExamAndRoom(examId, room_id);
    if (existing) {
        throw new ApiError(409, "This room is already allocated to this exam");
    }

    await assertRoomNotDoubleBooked(examId, room_id);

    const allocation = await allocationRepository.insertAllocation({
        exam_id: examId,
        room_id,
        student_count
    });

    return shapeAllocation(await allocationRepository.findAllocationById(allocation.allocation_id));
};

const getAllocationsByExamId = async (examId) => {
    const allocations = await allocationRepository.findAllocationsByExamId(examId);
    return allocations.map(shapeAllocation);
};

const updateAllocation = async (allocationId, updates) => {

    const existing = await allocationRepository.findAllocationById(allocationId);
    if (!existing) {
        throw new ApiError(404, "Allocation not found");
    }

    const roomId = updates.room_id || existing.room_id;
    const room = await roomRepository.findRoomById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const studentCount = updates.student_count || existing.student_count;
    if (studentCount > room.capacity) {
        throw new ApiError(400, `Student count (${studentCount}) exceeds room capacity (${room.capacity})`);
    }

    if (updates.room_id) {
        await assertRoomNotDoubleBooked(existing.exam_id, updates.room_id, allocationId);
    }

    await allocationRepository.updateAllocation(allocationId, updates);

    return shapeAllocation(await allocationRepository.findAllocationById(allocationId));
};

const deleteAllocation = async (allocationId, actor = {}) => {

    const existing = await allocationRepository.findAllocationById(allocationId);
    if (!existing) {
        throw new ApiError(404, "Allocation not found");
    }

    await allocationRepository.deleteAllocation(allocationId);

    await auditService.writeLog({
        action: "ROOM_ALLOCATION_REMOVED",
        performedBy: actor.id,
        target: `Exam #${existing.exam_id} — Room #${existing.room_id}`,
        details: null
    });

    return { message: "Room allocation removed successfully" };
};

module.exports = {
    addAllocation,
    getAllocationsByExamId,
    updateAllocation,
    deleteAllocation
};
