const Student = require("./students.model");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");

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
    
    return await Student.destroy({
        where: { usn: studentUsn }
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