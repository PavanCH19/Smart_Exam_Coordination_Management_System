const Student = require("./students.model");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");
const Attendance = require("../attendance_mng/attendance.model");
const AdmitCard = require("../admitcard_mng/admitcard.model");
const Seat = require("../seating_mng/seat.model");
const User = require("../auth/user.model");

const findStudentById = async (studentId) => {
    return await Student.findByPk(studentId);
};

const findStudentByEmail = async (email) => {
    return await Student.findOne({
        where: { email }
    });
};

const findStudentByUSN = async (usn) => {
    return await Student.findOne({
        where: { usn }
    });
};

const findStudentsByUSNs = async (usns) => {
    return await Student.findAll({
        where: { usn: { [Op.in]: usns } }
    });
};

const findStudentsByEmails = async (emails) => {
    return await Student.findAll({
        where: { email: { [Op.in]: emails } }
    });
};

const findAllStudents = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;
    
    return await Student.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [["student_id", "DESC"]]
    });
};

const insertStudent = async (student) => {
    return await Student.create(student);
};

const insertStudents = async (students) => {
    return await sequelize.transaction(async (transaction) => {
        return await Student.bulkCreate(students, { transaction, returning: true });
    });
};

const updateStudent = async (studentId, student) => {
    
    return await Student.update(
        student,
        {
            where: { usn: studentId }
        }
    );
};

const deleteStudent = async (studentUsn) => {

    return await sequelize.transaction(async (transaction) => {
        const student = await Student.findOne({
            where: { usn: studentUsn },
            transaction
        });

        if (!student) {
            return 0;
        }

        const dependentRecordFilter = { student_id: student.student_id };

        await Seat.destroy({ where: dependentRecordFilter, transaction });
        await Attendance.destroy({ where: dependentRecordFilter, transaction });
        await AdmitCard.destroy({ where: dependentRecordFilter, transaction });
        await User.destroy({
            where: { ...dependentRecordFilter, role: "STUDENT" },
            transaction
        });

        return await Student.destroy({
            where: { student_id: student.student_id },
            transaction
        });
    });
};

module.exports = {
    findStudentById,
    findStudentByEmail,
    findStudentByUSN,
    findStudentsByUSNs,
    findStudentsByEmails,
    findAllStudents,
    insertStudent,
    insertStudents,
    updateStudent,
    deleteStudent
};