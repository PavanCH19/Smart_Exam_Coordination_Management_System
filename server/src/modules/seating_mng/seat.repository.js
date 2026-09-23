const { Op } = require("sequelize");
const Seat = require("./seat.model");
const Student = require("../std_mng/students.model");

const studentAttributes = ["usn", "name", "section"];

const findSeatsByAllocationId = async (allocationId) => {
    return await Seat.findAll({
        where: { allocation_id: allocationId },
        include: [{ model: Student, attributes: studentAttributes }],
        order: [["seat_number", "ASC"]]
    });
};

const findSeatedStudentIdsForAllocations = async (allocationIds) => {
    const seats = await Seat.findAll({
        where: { allocation_id: { [Op.in]: allocationIds } },
        attributes: ["student_id"]
    });
    return seats.map((seat) => seat.student_id);
};

const deleteSeatsByAllocationId = async (allocationId) => {
    return await Seat.destroy({ where: { allocation_id: allocationId } });
};

const insertSeats = async (seats) => {
    return await Seat.bulkCreate(seats);
};

module.exports = {
    findSeatsByAllocationId,
    findSeatedStudentIdsForAllocations,
    deleteSeatsByAllocationId,
    insertSeats
};
