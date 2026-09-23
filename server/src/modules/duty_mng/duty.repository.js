const { Op } = require("sequelize");
const StaffDuty = require("./duty.model");
const Staff = require("../staff_mng/staff.model");
const Room = require("../room_mng/room.model");
const Exam = require("../exam_mng/exam.model");
const Subject = require("../subject_mng/subject.model");

const staffAttributes = ["staff_id", "employee_id", "name"];
const roomAttributes = ["room_number", "building"];

const findDutyById = async (dutyId) => {
    return await StaffDuty.findByPk(dutyId, {
        include: [
            { model: Staff, attributes: staffAttributes },
            { model: Room, attributes: roomAttributes }
        ]
    });
};

const findDutiesByExamId = async (examId) => {
    return await StaffDuty.findAll({
        where: { exam_id: examId },
        include: [
            { model: Staff, attributes: staffAttributes },
            { model: Room, attributes: roomAttributes }
        ],
        order: [["duty_id", "ASC"]]
    });
};

const findDutyByExamAndStaff = async (examId, staffId) => {
    return await StaffDuty.findOne({
        where: { exam_id: examId, staff_id: staffId }
    });
};

// "My duties" — the logged-in staff member's own duties, with the exam's
// date/time/subject and the room denormalized for direct display.
const findDutiesByStaffId = async (staffId, scope) => {

    const where = { staff_id: staffId };
    const examWhere = { status: { [Op.notIn]: ["COMPLETED", "CANCELLED"] } };

    const today = new Date().toISOString().slice(0, 10);

    if (scope === "today") {
        examWhere.exam_date = today;
    } else if (scope === "week") {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        examWhere.exam_date = { [Op.between]: [today, weekFromNow.toISOString().slice(0, 10)] };
    }

    return await StaffDuty.findAll({
        where: { ...where, status: "ASSIGNED" },
        include: [
            {
                model: Exam,
                where: Object.keys(examWhere).length ? examWhere : undefined,
                include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }]
            },
            { model: Room, attributes: roomAttributes }
        ],
        order: [[Exam, "exam_date", "ASC"], [Exam, "start_time", "ASC"]]
    });
};

const findTodaysDutyForStaff = async (staffId) => {
    const today = new Date().toISOString().slice(0, 10);

    return await StaffDuty.findOne({
        where: { staff_id: staffId },
        include: [
            {
                model: Exam,
                where: { exam_date: today },
                include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }]
            },
            { model: Room, attributes: roomAttributes }
        ]
    });
};

const insertDuty = async (duty) => {
    return await StaffDuty.create(duty);
};

const updateDuty = async (dutyId, duty) => {
    return await StaffDuty.update(
        duty,
        { where: { duty_id: dutyId } }
    );
};

const deleteDuty = async (dutyId) => {
    return await StaffDuty.destroy({
        where: { duty_id: dutyId }
    });
};

const countDutiesByExamId = async (examId) => {
    return await StaffDuty.count({ where: { exam_id: examId } });
};

const countDutiesByStaffId = async (staffId) => {
    return await StaffDuty.count({ where: { staff_id: staffId } });
};

module.exports = {
    findDutyById,
    findDutiesByExamId,
    findDutyByExamAndStaff,
    findDutiesByStaffId,
    findTodaysDutyForStaff,
    insertDuty,
    updateDuty,
    deleteDuty,
    countDutiesByExamId,
    countDutiesByStaffId
};
