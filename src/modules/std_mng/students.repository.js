const Student = require("./students.model");

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

const findAllStudents = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;
    
    return await Student.findAll({
        where: filters,
        limit,
        offset,
        order: [["student_id", "DESC"]]
    });
};

const insertStudent = async (student) => {
    return await Student.create(student);
};

const updateStudent = async (studentId, student) => {
    
    return await Student.update(
        student,
        {
            where: { student_id: studentId }
        }
    );
};

const deleteStudent = async (studentId) => {
    
    return await Student.destroy({
        where: { student_id: studentId }
    });
};

module.exports = {
    findStudentById,
    findStudentByEmail,
    findStudentByUSN,
    findAllStudents,
    insertStudent,
    updateStudent,
    deleteStudent
};