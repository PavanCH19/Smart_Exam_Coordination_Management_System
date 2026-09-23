const RoomAllocation = require("./allocation.model");
const Room = require("../room_mng/room.model");

const roomAttributes = ["room_number", "building", "capacity"];

const findAllocationById = async (allocationId) => {
    return await RoomAllocation.findByPk(allocationId, {
        include: [{ model: Room, attributes: roomAttributes }]
    });
};

const findAllocationsByExamId = async (examId) => {
    return await RoomAllocation.findAll({
        where: { exam_id: examId },
        include: [{ model: Room, attributes: roomAttributes }],
        order: [["allocation_id", "ASC"]]
    });
};

const findAllocationByExamAndRoom = async (examId, roomId) => {
    return await RoomAllocation.findOne({
        where: { exam_id: examId, room_id: roomId }
    });
};

const sumStudentCountForExam = async (examId) => {
    const allocations = await RoomAllocation.findAll({ where: { exam_id: examId } });
    return allocations.reduce((sum, a) => sum + a.student_count, 0);
};

const insertAllocation = async (allocation) => {
    return await RoomAllocation.create(allocation);
};

const updateAllocation = async (allocationId, allocation) => {
    return await RoomAllocation.update(
        allocation,
        { where: { allocation_id: allocationId } }
    );
};

const deleteAllocation = async (allocationId) => {
    return await RoomAllocation.destroy({
        where: { allocation_id: allocationId }
    });
};

const countAllocationsByExamId = async (examId) => {
    return await RoomAllocation.count({ where: { exam_id: examId } });
};

module.exports = {
    findAllocationById,
    findAllocationsByExamId,
    findAllocationByExamAndRoom,
    sumStudentCountForExam,
    insertAllocation,
    updateAllocation,
    deleteAllocation,
    countAllocationsByExamId
};
